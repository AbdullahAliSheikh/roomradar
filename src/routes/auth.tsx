import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/components/AuthPage.jsx";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Room Radar" }] }),
});