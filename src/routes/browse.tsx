import { createFileRoute } from "@tanstack/react-router";
import BrowseAds from "@/components/BrowseAds.jsx";

export const Route = createFileRoute("/browse")({
  component: BrowseAds,
});