import { Binary } from "lucide-react";
import { TrackerPage } from "@/components/trackers/TrackerPage";

export default function DsaTrackerPage() {
  return (
    <TrackerPage
      kind="dsa"
      title="DSA Roadmap"
      description="Track problems solved across every data structure & algorithm topic."
      icon={<Binary className="h-5 w-5" />}
    />
  );
}
