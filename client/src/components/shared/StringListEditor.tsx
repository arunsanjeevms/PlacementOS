import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

/** Add/remove a list of short strings (questions, concepts…) via Enter. */
export function StringListEditor({ items, onChange, placeholder = "Add and press Enter…" }: Props) {
  const [draft, setDraft] = useState("");
  const add = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && draft.trim()) {
      e.preventDefault();
      onChange([...items, draft.trim()]);
      setDraft("");
    }
  };
  return (
    <div className="space-y-1.5">
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((q, i) => (
            <div key={i} className="group flex items-start gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm">
              <span className="flex-1">{q}</span>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={add} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}
