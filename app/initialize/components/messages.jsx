"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function Messages({ messages, onChange }) {
  const [newRole, setNewRole] = useState("user");
  const [newContent, setNewContent] = useState("");

  const updateMessage = (index, key, value) => {
    const updatedMessages = [...messages];
    updatedMessages[index][key] = value;
    onChange(updatedMessages);
  };

  const addMessage = () => {
    if (!newContent.trim()) return;
    const updatedMessages = [
      ...messages,
      { role: newRole, content: newContent.trim() },
    ];
    onChange(updatedMessages);
    setNewContent("");
  };

  const removeMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    onChange(updatedMessages);
  };

  return (
    <div className="grid gap-4">
      <Label className="text-green-400">Messages</Label>
      {messages?.map((msg, index) => (
        <div
          key={index}
          className="border p-3 rounded-md bg-black text-green-400 border-green-500"
        >
          <select
            value={msg.role}
            onChange={(e) => updateMessage(index, "role", e.target.value)}
            className="bg-gray-900 text-green-400 border-green-500 px-2 py-1 rounded"
          >
            <option value="system">System</option>
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
          <Textarea
            value={msg.content}
            onChange={(e) => updateMessage(index, "content", e.target.value)}
            className="mt-2 bg-gray-900 text-green-400 border-green-500"
          />
          <Button
            variant="destructive"
            className="mt-2 bg-red-600 text-white"
            onClick={() => removeMessage(index)}
          >
            Remove
          </Button>
        </div>
      ))}

      {/* Add New Message Section */}
      <div className="border p-3 rounded-md bg-black border-green-500">
        <Label className="text-green-400">Add New Message</Label>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="mt-2 bg-gray-900 text-green-400 border-green-500 px-2 py-1 rounded"
        >
          <option value="system">System</option>
          <option value="user">User</option>
          <option value="assistant">Assistant</option>
        </select>
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Enter message content..."
          className="mt-2 bg-gray-900 text-green-400 border-green-500"
        />
        <Button className="mt-2 bg-green-600 text-white" onClick={addMessage}>
          Add Message
        </Button>
      </div>
    </div>
  );
}
