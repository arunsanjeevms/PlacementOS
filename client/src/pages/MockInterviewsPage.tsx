import { Mic } from "lucide-react";
import { JournalView } from "@/components/journal/JournalView";

export default function MockInterviewsPage() {
  return (
    <JournalView
      type="mock"
      title="Mock Interviews"
      description="Track your practice interviews and sharpen your delivery."
      icon={<Mic className="h-5 w-5" />}
      emptyLabel="No mock interviews yet"
    />
  );
}
