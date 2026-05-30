import { createFileRoute } from "@tanstack/react-router";
import UploadAd from "@/components/UploadAd.jsx";

export const Route = createFileRoute("/upload")({
  component: UploadAd,
});