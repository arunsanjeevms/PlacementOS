import { NotebookPen } from "lucide-react";
import { JournalView } from "@/components/journal/JournalView";

export default function InterviewJournalPage() {
  return (
    <JournalView
      type="real"
      title="Interview Journal"
      description="Reflect on every real interview to learn faster."
      icon={<NotebookPen className="h-5 w-5" />}
      emptyLabel="No interviews logged yet"
    />
  );
}
