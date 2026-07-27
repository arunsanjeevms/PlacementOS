import { Coffee } from "lucide-react";
import { TrackerPage } from "@/components/trackers/TrackerPage";

export default function JavaTrackerPage() {
  return (
    <TrackerPage
      kind="java"
      title="Java Roadmap"
      description="Master core Java from basics to Spring Boot & REST APIs."
      icon={<Coffee className="h-5 w-5" />}
    />
  );
}
