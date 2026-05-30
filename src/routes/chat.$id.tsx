import { createFileRoute } from "@tanstack/react-router";
import ChatThread from "@/components/ChatThread.jsx";

export const Route = createFileRoute("/chat/$id")({
  component: ChatThread,
});