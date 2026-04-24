"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  id?: string;
  ariaLabelledBy?: string;
};

export function MonacoCodeInput({
  value,
  onChange,
  language = "typescript",
  height = "320px",
  id,
  ariaLabelledBy,
}: Props) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset/legend would disrupt the Monaco wrapper layout; role=group with aria-labelledby is the documented ARIA equivalent
    <div
      aria-labelledby={ariaLabelledBy}
      className="overflow-hidden rounded-md border border-input"
      id={id}
      role="group"
      style={{ height }}
    >
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          tabSize: 2,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      />
    </div>
  );
}
