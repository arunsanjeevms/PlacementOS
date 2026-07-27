import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import type { Extensions } from "@tiptap/react";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import java from "highlight.js/lib/languages/java";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";

// Curate languages relevant to placement prep to keep the bundle lean.
const lowlight = createLowlight();
lowlight.register({ javascript, js: javascript, typescript, ts: typescript, java, python, py: python, cpp, "c++": cpp, c, sql, bash, sh: bash, json, xml, html: xml, css });

export const editorExtensions: Extensions = [
  StarterKit.configure({
    codeBlock: false, // replaced by lowlight version
    heading: { levels: [1, 2, 3] },
  }),
  Placeholder.configure({
    placeholder: "Start writing… use [[Note Title]] to link notes",
  }),
  Underline,
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noreferrer", target: "_blank" } }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Image.configure({ inline: false, allowBase64: true }),
  CodeBlockLowlight.configure({ lowlight }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];
