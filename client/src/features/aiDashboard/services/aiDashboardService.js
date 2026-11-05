import { apiGet, apiDelete } from "@/servies/api";
import { getSessionId, setSessionId, setChatId, getChatId } from "@/servies/api";

export const fetchForecast = async (storeId) => {
  const response = await apiGet(`/ai/${storeId}/forecast`);
  return response?.data || [];
};

export const fetchRestockPlan = async (storeId) => {
  const response = await apiGet(`/ai/${storeId}/restock`);
  return response?.data || [];
};

export const fetchInsights = async (storeId) => {
  const response = await apiGet(`/ai/${storeId}/insights`);
  return response?.data || [];
};

export const fetchSummary = async (storeId) => {
  const response = await apiGet(`/ai/${storeId}/summary`, { timeout: 45000 });
  return response?.data || null;
};

export const fetchProductInsight = async (storeId, productId) => {
  const response = await apiGet(`/ai/${storeId}/product/${productId}`);
  return response?.data || null;
};

// ---------------------------------------------------------------------------
// Chat history
// ---------------------------------------------------------------------------

export const fetchChatList = async (storeId) => {
  const response = await apiGet(`/ai/${storeId}/chats`);
  return response?.data || { chats: [], total: 0 };
};

export const fetchChatMessages = async (storeId, chatId) => {
  const response = await apiGet(`/ai/${storeId}/chats/${chatId}`);
  return response?.data || { chat_id: chatId, messages: [] };
};

export const deleteChat = async (storeId, chatId) => {
  const response = await apiDelete(`/ai/${storeId}/chats/${chatId}`);
  return response || { data: { deleted: false } };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Resolves the WebSocket origin (ws:// or wss://) for AI services.
 * Matches resolution logic in useVoiceAssistant.js for consistency across voice and text.
 */
export const getWsOrigin = () => {
  const toWsOrigin = (url) => {
    try {
      const u = new URL(url);
      const proto = u.protocol === "https:" ? "wss:" : "ws:";
      return `${proto}//${u.host}`;
    } catch {
      return null;
    }
  };

  let aiWsBase = null;
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_AI_WS_URL) {
      try {
        const raw = process.env.NEXT_PUBLIC_AI_WS_URL.trim().replace(/\/+$/, "");
        if (/^wss?:\/\//i.test(raw)) {
          const u = new URL(raw);
          aiWsBase = `${u.protocol}//${u.host}`;
        } else {
          aiWsBase = toWsOrigin(raw);
        }
      } catch {
        aiWsBase = null;
      }
    }
    if (!aiWsBase && process.env.NEXT_PUBLIC_AI_URL) {
      aiWsBase = toWsOrigin(process.env.NEXT_PUBLIC_AI_URL.trim());
    }
    if (!aiWsBase && process.env.NEXT_PUBLIC_API_URL) {
      aiWsBase = toWsOrigin(process.env.NEXT_PUBLIC_API_URL.trim());
    }
  }

  if (!aiWsBase && typeof window !== "undefined" && window.location) {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    aiWsBase = `${proto}//${window.location.host}`;
  }

  return aiWsBase || "ws://localhost:8080";
};

/**
 * Stream Copilot response via WebSocket for zero proxy-buffering latency (e.g. on Render).
 */
export const streamCopilotResponseWs = ({
  storeId,
  message,
  chatId,
  language,
  onEvent,
  signal,
}) => {
  return new Promise((resolve, reject) => {
    if (typeof WebSocket === "undefined") {
      return reject(new Error("WebSockets are not supported in this environment."));
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const sessionId = getSessionId();
    const effectiveChatId = chatId || getChatId();
    const effectiveLanguage =
      language ||
      (typeof window !== "undefined" ? localStorage.getItem("preferredLanguage") : null) ||
      (typeof document !== "undefined" ? document.documentElement.lang : null) ||
      "en";

    const wsBase = getWsOrigin();
    const wsUrl = new URL("/ws/copilot", wsBase);
    if (storeId) wsUrl.searchParams.set("store_id", String(storeId));
    if (effectiveChatId) wsUrl.searchParams.set("chat_id", String(effectiveChatId));
    if (token) wsUrl.searchParams.set("token", token);

    let ws = null;
    let hasReceivedMessage = false;
    let isFinished = false;

    try {
      ws = new WebSocket(wsUrl.toString());
    } catch (e) {
      return reject(e);
    }

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", handleAbort);
      }
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
      }
    };

    const handleAbort = () => {
      if (!isFinished && ws && ws.readyState === WebSocket.OPEN) {
        try { ws.close(); } catch (_) {}
      }
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) {
        return handleAbort();
      }
      signal.addEventListener("abort", handleAbort);
    }

    ws.onopen = () => {
      try {
        ws.send(
          JSON.stringify({
            action: "message",
            store_id: storeId,
            message,
            session_id: sessionId,
            chat_id: effectiveChatId,
            language: effectiveLanguage,
          })
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    ws.onmessage = (event) => {
      hasReceivedMessage = true;
      try {
        const raw = JSON.parse(event.data);
        const eventName = raw.event || "message";
        const payload = raw.data || {};

        if (eventName === "session" && payload?.chatId) {
          setChatId(payload.chatId);
          onEvent?.({ event: "session", payload });
          return;
        }

        onEvent?.({ event: eventName, payload });

        if (eventName === "done") {
          isFinished = true;
          cleanup();
          try { ws.close(); } catch (_) {}
          resolve();
        }
      } catch (err) {
        console.warn("[CopilotWS] Failed to parse message frame:", err);
      }
    };

    ws.onerror = () => {
      if (!hasReceivedMessage) {
        cleanup();
        reject(new Error("WebSocket connection failed to establish"));
      } else {
        onEvent?.({ event: "error", payload: { message: "WebSocket connection interrupted" } });
      }
    };

    ws.onclose = () => {
      cleanup();
      if (!isFinished) {
        if (!hasReceivedMessage) {
          reject(new Error("WebSocket closed before receiving initial data"));
        } else {
          resolve();
        }
      }
    };
  });
};

/**
 * Stream Copilot response via standard SSE (POST /{store_id}/copilot/stream).
 */
export const streamCopilotResponseSse = async ({
  storeId,
  message,
  chatId,
  language,
  onEvent,
  signal,
}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const sessionId = getSessionId();
  const effectiveChatId = chatId || getChatId();
  const effectiveLanguage =
    language ||
    (typeof window !== "undefined" ? localStorage.getItem("preferredLanguage") : null) ||
    (typeof document !== "undefined" ? document.documentElement.lang : null) ||
    "en";

  const response = await fetch(`${API_BASE_URL}/ai/${storeId}/copilot/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      chat_id: effectiveChatId,
      language: effectiveLanguage,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorJson = null;
    try { errorJson = JSON.parse(errorText); } catch (_) {}
    const err = new Error(errorJson?.message || errorText || `Failed with status ${response.status}`);
    err.status = response.status;
    err.code = errorJson?.code || (response.status === 402 ? "INSUFFICIENT_CREDITS" : null);
    err.data = errorJson;
    throw err;
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  let buffer = "";

  const parsePayload = (rawData) => {
    if (!rawData) return {};
    try {
      return JSON.parse(rawData);
    } catch {
      return { text: rawData };
    }
  };

  const parseEventBlock = (block) => {
    const lines = block.split("\n");
    let event = "message";
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    const rawData = dataLines.join("\n");
    const payload = parsePayload(rawData);

    if (event === "session" && payload?.chatId) {
      setChatId(payload.chatId);
      onEvent?.({ event: "session", payload });
      return;
    }

    onEvent?.({ event, payload });
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (part.trim()) {
          parseEventBlock(part);
        }
      }
    }

    if (buffer.trim()) {
      parseEventBlock(buffer);
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * Stream Copilot response: Attempts WebSocket first for sub-millisecond,
 * unbuffered real-time delivery; falls back gracefully to SSE.
 */
export const streamCopilotResponse = async (params) => {
  try {
    return await streamCopilotResponseWs(params);
  } catch (wsErr) {
    if (params.signal?.aborted) {
      throw wsErr;
    }
    console.info(
      "[Copilot] WebSocket streaming unavailable or disconnected, falling back to SSE:",
      wsErr?.message
    );
    return await streamCopilotResponseSse(params);
  }
};

/**
 * Stream clarification resume via WebSocket.
 */
export const streamClarifyResponseWs = ({
  storeId,
  chatId,
  answer,
  onEvent,
  signal,
}) => {
  return new Promise((resolve, reject) => {
    if (typeof WebSocket === "undefined") {
      return reject(new Error("WebSockets are not supported in this environment."));
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const wsBase = getWsOrigin();
    const wsUrl = new URL("/ws/copilot", wsBase);
    if (storeId) wsUrl.searchParams.set("store_id", String(storeId));
    if (chatId) wsUrl.searchParams.set("chat_id", String(chatId));
    if (token) wsUrl.searchParams.set("token", token);

    let ws = null;
    let hasReceivedMessage = false;
    let isFinished = false;

    try {
      ws = new WebSocket(wsUrl.toString());
    } catch (e) {
      return reject(e);
    }

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", handleAbort);
      }
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
      }
    };

    const handleAbort = () => {
      if (!isFinished && ws && ws.readyState === WebSocket.OPEN) {
        try { ws.close(); } catch (_) {}
      }
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) {
        return handleAbort();
      }
      signal.addEventListener("abort", handleAbort);
    }

    ws.onopen = () => {
      try {
        ws.send(
          JSON.stringify({
            action: "clarify",
            store_id: storeId,
            chat_id: chatId,
            answer,
          })
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    ws.onmessage = (event) => {
      hasReceivedMessage = true;
      try {
        const raw = JSON.parse(event.data);
        const eventName = raw.event || "message";
        const payload = raw.data || {};

        if (eventName === "session" && payload?.chatId) {
          setChatId(payload.chatId);
          onEvent?.({ event: "session", payload });
          return;
        }

        onEvent?.({ event: eventName, payload });

        if (eventName === "done") {
          isFinished = true;
          cleanup();
          try { ws.close(); } catch (_) {}
          resolve();
        }
      } catch (err) {
        console.warn("[ClarifyWS] Failed to parse message frame:", err);
      }
    };

    ws.onerror = () => {
      if (!hasReceivedMessage) {
        cleanup();
        reject(new Error("WebSocket connection failed to establish"));
      } else {
        onEvent?.({ event: "error", payload: { message: "WebSocket connection interrupted" } });
      }
    };

    ws.onclose = () => {
      cleanup();
      if (!isFinished) {
        if (!hasReceivedMessage) {
          reject(new Error("WebSocket closed before receiving initial data"));
        } else {
          resolve();
        }
      }
    };
  });
};

/**
 * Stream clarification resume via standard SSE (POST /{store_id}/clarify).
 */
export const streamClarifyResponseSse = async ({
  storeId,
  chatId,
  answer,
  onEvent,
  signal,
}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const response = await fetch(`${API_BASE_URL}/ai/${storeId}/clarify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ chat_id: chatId, answer }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorJson = null;
    try { errorJson = JSON.parse(errorText); } catch (_) {}
    const err = new Error(errorJson?.message || errorText || `Clarify failed with status ${response.status}`);
    err.status = response.status;
    err.code = errorJson?.code || (response.status === 402 ? "INSUFFICIENT_CREDITS" : null);
    err.data = errorJson;
    throw err;
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  let buffer = "";

  const parsePayload = (rawData) => {
    if (!rawData) return {};
    try {
      return JSON.parse(rawData);
    } catch {
      return { text: rawData };
    }
  };

  const parseEventBlock = (block) => {
    const lines = block.split("\n");
    let event = "message";
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    const rawData = dataLines.join("\n");
    const payload = parsePayload(rawData);

    if (event === "session" && payload?.chatId) {
      setChatId(payload.chatId);
      onEvent?.({ event: "session", payload });
      return;
    }

    onEvent?.({ event, payload });
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (part.trim()) {
          parseEventBlock(part);
        }
      }
    }

    if (buffer.trim()) {
      parseEventBlock(buffer);
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * Stream clarification resume: Attempts WebSocket first; falls back gracefully to SSE.
 */
export const streamClarifyResponse = async (params) => {
  try {
    return await streamClarifyResponseWs(params);
  } catch (wsErr) {
    if (params.signal?.aborted) {
      throw wsErr;
    }
    console.info(
      "[Clarify] WebSocket streaming unavailable or disconnected, falling back to SSE:",
      wsErr?.message
    );
    return await streamClarifyResponseSse(params);
  }
};

// ---------------------------------------------------------------------------
// Agent-generated files (Excel / Word / CSV / PDF stored in Cloudflare R2)
// ---------------------------------------------------------------------------

/**
 * Fetch the list of agent-generated files for a store from R2.
 * @param {string} storeId
 * @returns {Promise<{ files: Array, total: number }>}
 */
export const fetchAgentFiles = async (storeId) => {
  const response = await apiGet(`/ai/${storeId}/files`);
  return response?.data || { files: [], total: 0 };
};

/**
 * Request a short-lived presigned download URL for a file stored in R2.
 * @param {string} storeId
 * @param {string} storageKey  – the R2 object key
 * @returns {Promise<{ download_url: string, filename: string, expires_in: number }>}
 */
export const fetchFileDownloadUrl = async (storeId, storageKey) => {
  const encoded = encodeURIComponent(storageKey);
  const response = await apiGet(`/ai/${storeId}/files/download?key=${encoded}`);
  return response?.data || null;
};
