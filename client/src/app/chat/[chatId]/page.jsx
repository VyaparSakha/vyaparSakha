"use client";

import { useParams } from "next/navigation";
import ChatViewContainer from "@/features/chat/components/ChatViewContainer";

export default function DynamicChatPage() {
  const params = useParams();
  const chatId = params?.chatId || null;

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-3 flex flex-col overflow-hidden">
      <ChatViewContainer initialChatId={chatId} />
    </div>
  );
}
