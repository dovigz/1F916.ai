"use client";

import * as React from "react";
import { RotateCcw, Clipboard, Save, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DOMPurify from "dompurify";

const syntaxHighlight = (json) => {
  const safeJson = DOMPurify.sanitize(json);
  return safeJson.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-foreground";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-purple-400" : "text-green-400";
      } else if (/true|false/.test(match)) {
        cls = "text-blue-400";
      } else if (/null/.test(match)) {
        cls = "text-red-400";
      } else if (!isNaN(match)) {
        cls = "text-amber-400";
      }
      return `<span class="${cls}">${DOMPurify.sanitize(match)}</span>`;
    }
  );
};

export default function CodeViewer({
  rawCode,
  setRawCode,
  initialCode,
  onSave,
}) {
  const preRef = React.useRef(null);
  const textRef = React.useRef(null);

  // Initialize editor content with rawCode (from sessionStorage if available)
  React.useLayoutEffect(() => {
    if (textRef.current && preRef.current) {
      textRef.current.textContent = rawCode;
      preRef.current.innerHTML = syntaxHighlight(rawCode);
    }
  }, []);

  // Update the highlighted view when rawCode changes externally
  React.useEffect(() => {
    if (
      textRef.current &&
      preRef.current &&
      textRef.current.textContent !== rawCode
    ) {
      textRef.current.textContent = rawCode;
      preRef.current.innerHTML = syntaxHighlight(rawCode);
    }
  }, [rawCode]);

  const saveCursorPosition = () => {
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(textRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  };

  const restoreCursorPosition = (position) => {
    if (position === null) return;
    const textNode = textRef.current.firstChild;
    if (!textNode) return;

    const range = document.createRange();
    const sel = window.getSelection();
    let pos = 0;
    let node = textNode;

    while (pos < position && node.length > 0) {
      const nextPos = pos + node.length;
      if (nextPos > position) break;
      pos = nextPos;
      node = node.nextSibling;
    }

    const offset = position - pos;
    range.setStart(node, Math.min(offset, node.length));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleInput = (e) => {
    const newText = DOMPurify.sanitize(e.currentTarget.textContent);
    const cursorPos = saveCursorPosition();

    setRawCode(newText);

    if (preRef.current) {
      preRef.current.innerHTML = syntaxHighlight(newText);
    }

    requestAnimationFrame(() => {
      restoreCursorPosition(cursorPos);
    });
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    document.execCommand("insertText", false, DOMPurify.sanitize(text));
  };

  const resetCode = () => {
    setRawCode(initialCode);
    if (textRef.current) {
      textRef.current.textContent = initialCode;
    }
    if (preRef.current) {
      preRef.current.innerHTML = syntaxHighlight(initialCode);
    }
  };

  const userId = sessionStorage.getItem("ai_agent_uid") || "CONNECTING...";

  return (
    <div className="mt-4">
      <div className="text-cyan-400 hover:text-cyan-300 px-2 py-2 mt-4 flex items-center space-x-2">
        <Cpu className="h-4 w-4" />
        <span>{userId}</span>{" "}
      </div>

      <Card className="relative overflow-hidden rounded-md border border-green-500 bg-black">
        <div className="flex justify-between items-center p-3  border-b border-green-500">
          <h3 className="text-sm font-medium text-green-400 font-mono">
            JSON CONFIGURATION
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-950"
              onClick={() => navigator.clipboard.writeText(rawCode)}
            >
              <Clipboard className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-950"
              onClick={onSave}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
        <div className="relative rounded-md bg-black overflow-auto">
          <pre
            ref={preRef}
            className="absolute m-0 p-6 font-mono text-sm pointer-events-none whitespace-pre-wrap break-words"
          />
          <div
            ref={textRef}
            className="relative p-6 font-mono text-sm text-transparent caret-green-500 outline-none"
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            suppressContentEditableWarning
            style={{ whiteSpace: "pre-wrap" }}
          />
        </div>
      </Card>
      <div className="flex items-center space-x-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 border-green-500 text-green-500 hover:bg-green-950 hover:text-green-400"
          onClick={resetCode}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          <span className="text-xs">RESET</span>
        </Button>
      </div>
    </div>
  );
}
