import { createFileRoute } from "@tanstack/react-router";
import AdDetail from "@/components/AdDetail.jsx";

export const Route = createFileRoute("/ad/$id")({
  component: AdDetail,
});