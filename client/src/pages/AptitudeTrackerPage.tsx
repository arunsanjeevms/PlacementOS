import { Calculator } from "lucide-react";
import { TrackerPage } from "@/components/trackers/TrackerPage";

export default function AptitudeTrackerPage() {
  return (
    <TrackerPage
      kind="aptitude"
      title="Aptitude"
      description="Sharpen quantitative, logical and verbal aptitude topics."
      icon={<Calculator className="h-5 w-5" />}
    />
  );
}
