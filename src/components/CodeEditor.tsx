import React from 'react';
import Editor from 'react-simple-code-editor';
// The explicit extension ".js" and "/components/prism-python" requires specific prismjs exports, let's use the core
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-twilight.css'; // Dark theme for Prism

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-[#141414]">
      <Editor
        value={code}
        onValueChange={onChange}
        highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
        padding={16}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14,
          minHeight: '200px',
        }}
        className="editor-input outline-none focus:outline-none"
      />
    </div>
  );
}
