import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-twilight.css';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const lineCount = Math.max(8, code.split('\n').length);

  return (
    <div className="rounded-lg overflow-hidden border border-white/15 bg-[#090C12] flex">
      <div
        aria-hidden="true"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13,
          lineHeight: '1.6',
          paddingTop: 16,
          paddingBottom: 16
        }}
        className="select-none px-2.5 text-right text-white/25 bg-[#0B0F17] border-r border-white/10 shrink-0"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1}>{i + 1}</div>
        ))}
      </div>
      <div className="flex-1 overflow-x-auto">
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={src => Prism.highlight(src, Prism.languages.python, 'python')}
          padding={16}
          textareaId="python-math-editor"
          aria-label="Python math code editor"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            lineHeight: '1.6',
            minHeight: '220px'
          }}
          className="editor-input outline-none focus:outline-none text-[#E8E6E1]"
        />
      </div>
    </div>
  );
}
