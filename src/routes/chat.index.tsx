import { createFileRoute } from "@tanstack/react-router";
import ChatList from "@/components/ChatList.jsx";

export const Route = createFileRoute("/chat/")({
  component: ChatList,
});
