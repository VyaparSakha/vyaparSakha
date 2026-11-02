"use client";

import ChatViewContainer from "@/features/chat/components/ChatViewContainer";

export default function ChatRootPage() {
  return (
    <div className="h-[calc(100vh-5rem)] w-full p-0 flex flex-col overflow-hidden">
      <ChatViewContainer initialChatId={null} />
    </div>
  );
}
