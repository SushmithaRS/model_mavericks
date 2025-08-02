import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const Chatbot = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
  if (!input.trim() || !sessionId) {
    alert("Session ID missing or input is empty.");
    return;
  }

  setLoading(true);
  const userMsg = { role: "user", content: input };
  setMessages((prev) => [...prev, userMsg]);
    const formData = new FormData();
formData.append("session_id", sessionId);
formData.append("question", input);
  try {
const res = await axios.post("http://localhost:8000/ask-ai/", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: res.data.answer }
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Error: ${err.response?.data?.detail || "Unable to get response."}`
      }
    ]);
  }

  setInput("");
  setLoading(false);
};

console.log("Chatbot sessionId:", sessionId);
  return (
    <div className="chatbot-container">
      <h2>AI Chatbot</h2>
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "chat-user" : "chat-assistant"}>
            <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
          </div>
        ))}
        {loading && <div className="chat-assistant">Bot: ...</div>}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
