"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const lightSyntax = HighlightStyle.define([
  { tag: tags.keyword, color: "#5b21b6", fontWeight: "600" },
  { tag: tags.operator, color: "#1d5fd1" },
  { tag: tags.number, color: "#b45309" },
  { tag: tags.string, color: "#15803d" },
  { tag: tags.comment, color: "#7c8aa5", fontStyle: "italic" },
  { tag: tags.function(tags.variableName), color: "#0369a1" },
  { tag: tags.variableName, color: "#0f1b33" },
]);

const lightEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#0f1b33",
    fontSize: "0.875rem",
  },
  ".cm-content": {
    caretColor: "#2f7bf0",
    fontFamily: "var(--font-jetbrains-mono), monospace",
    minHeight: "240px",
    padding: "1rem 0",
  },
  ".cm-gutters": {
    backgroundColor: "#f6f9ff",
    border: "none",
    color: "#7c8aa5",
  },
  ".cm-activeLine": {
    backgroundColor: "#f6f9ff",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#e6f0ff",
    color: "#1d5fd1",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#2f7bf0",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "#dcebff",
  },
});

const editorExtensions = [
  javascript(),
  syntaxHighlighting(lightSyntax),
  lightEditorTheme,
];

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
};

export default function CodeEditor({ value, onChange, readOnly }: CodeEditorProps) {
  return (
    <CodeMirror
      aria-label="JavaScript challenge code"
      value={value}
      readOnly={readOnly}
      height="240px"
      extensions={editorExtensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
      }}
    />
  );
}
