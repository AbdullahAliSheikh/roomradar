import { createFileRoute } from "@tanstack/react-router";
import Account from "@/components/Account.jsx";

export const Route = createFileRoute("/account")({
  component: Account,
});