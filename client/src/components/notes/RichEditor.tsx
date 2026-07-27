import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "./editor-extensions";
import { EditorToolbar } from "./EditorToolbar";

interface RichEditorProps {
  noteId: string;
  content: string;
  editable?: boolean;
  onChange: (html: string, text: string) => void;
}

export function RichEditor({ noteId, content, editable = true, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions,
    content,
    editable,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-invert max-w-none focus:outline-none px-6 py-5 min-h-[50vh]",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML(), e.getText()),
  });

  // Load a different note's content when the selection changes.
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
