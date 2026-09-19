/**
 * Monaco-backed code editor. Lazy-imported to keep initial bundle slim.
 */
import Editor, { type OnMount } from "@monaco-editor/react";
import { useCallback } from "react";

export const SUPPORTED_LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },

] as const;

export type SupportedLanguageId = (typeof SUPPORTED_LANGUAGES)[number]["id"];

export const STARTER_CODE: Record<SupportedLanguageId, string> = {
  cpp: `class Solution {\npublic:\n    // write your solution here\n};\n`,
  java: `class Solution {\n    // write your solution here\n}\n`,
 
};

interface CodeEditorProps {
  language: SupportedLanguageId;
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const handleMount: OnMount = useCallback((editor) => {
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      padding: { top: 12, bottom: 12 },
    });
  }, []);

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={language}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      loading={
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Loading editor…
        </div>
      }
      options={{
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
      }}
    />
  );
}
