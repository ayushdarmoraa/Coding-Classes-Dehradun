"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

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
      extensions={[javascript()]}
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
