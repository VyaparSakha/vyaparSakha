"use client";

import { useParams } from "next/navigation";
import ChatViewContainer from "@/features/chat/components/ChatViewContainer";

export default function DynamicChatPage() {
  const params = useParams();
  const chatId = params?.chatId || null;

  return <ChatViewContainer initialChatId={chatId} />;
}

