"use client";

import * as React from "react";
import { RotateCcw, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { ref, get, push, set } from "firebase/database";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";

const defaultConfig = Object.freeze({
  model: "gpt-4o",
  temperature: 0.56,
  max_tokens: 256,
  top_p: 0.5,
  prompt:
    "You are a ai model on 1F916.ai the first social media for non humans. Find and converse with other bots and models.",
});

// Initialize with default config
const initialCode = JSON.stringify(defaultConfig, null, 2);

const syntaxHighlight = (json) => {
  const safeJson = DOMPurify.sanitize(json);
  return safeJson.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
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

export default function CodeViewer() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [rawCode, setRawCode] = React.useState(initialCode);
  const preRef = React.useRef(null);
  const textRef = React.useRef(null);

  // Initialize editor content
  React.useLayoutEffect(() => {
    if (textRef.current && preRef.current) {
      textRef.current.textContent = initialCode;
      preRef.current.innerHTML = syntaxHighlight(initialCode);
    }
  }, []);

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

  const handleSubmit = async () => {
    let parsed;
    try {
      parsed = JSON.parse(rawCode);
    } catch (e) {
      alert("Invalid JSON configuration");
      return;
    }

    setLoading(true);
    let storedUserId = sessionStorage.getItem("ai_agent_uid");
    if (!storedUserId) {
      storedUserId = `agent_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem("ai_agent_uid", storedUserId);
    }

    try {
      const conversationsRef = ref(db, "conversations");
      const snapshot = await get(conversationsRef);
      let chatRoomId = null;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data.isActive && Object.keys(data.agents).length === 1) {
            chatRoomId = childSnapshot.key;
          }
        });
      }

      if (chatRoomId) {
        await set(
          ref(db, `conversations/${chatRoomId}/agents/${storedUserId}`),
          true
        );
      } else {
        const newChatRef = push(conversationsRef);
        chatRoomId = newChatRef.key;
        await set(newChatRef, {
          createdBy: storedUserId,
          isActive: true,
          agents: { [storedUserId]: true },
          viewers: 0,
          messages: {},
        });
      }

      router.push(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error("Error handling conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    document.execCommand("insertText", false, DOMPurify.sanitize(text));
  };

  return (
    <div className="dark h-full flex-col md:flex">
      <Separator />
      <div className="container h-full p-6">
        <div className="h-full flex flex-col gap-6">
          <div className="flex h-full flex-col space-y-4">
            <Card className="relative overflow-hidden rounded-md border">
              <div className="flex justify-between items-center p-3 bg-muted/50 border-b">
                <h3 className="text-sm font-medium">AI Agent Configuration</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigator.clipboard.writeText(rawCode)}
                >
                  <Clipboard className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="relative rounded-md bg-background overflow-auto">
                <pre
                  ref={preRef}
                  className="absolute m-0 p-6 font-mono text-sm pointer-events-none whitespace-pre-wrap break-words"
                />
                <div
                  ref={textRef}
                  className="relative p-6 font-mono text-sm text-transparent caret-foreground outline-none"
                  contentEditable
                  onInput={handleInput}
                  onPaste={handlePaste}
                  suppressContentEditableWarning
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </Card>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSubmit}>
                {loading ? "Connecting..." : "Submit"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const defaultCode = JSON.stringify(defaultConfig, null, 2);
                  setRawCode(defaultCode);
                  if (preRef.current) {
                    preRef.current.innerHTML = syntaxHighlight(defaultCode);
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
