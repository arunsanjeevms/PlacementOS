import { Database } from "lucide-react";
import { TrackerPage } from "@/components/trackers/TrackerPage";

export default function CoreTrackerPage() {
  return (
    <TrackerPage
      kind="core"
      title="CS Fundamentals"
      description="SQL, DBMS, OS, CN, OOPS, system design, Git & interview soft skills."
      icon={<Database className="h-5 w-5" />}
    />
  );
}
