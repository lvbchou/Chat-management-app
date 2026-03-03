import { Spin } from "antd";

export default function MessageList({ messages = [], botTyping = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {messages.map((m) => {
        const isUser = m.from === "user";
        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: 520,
                borderRadius: 16,
                padding: "10px 12px",
                border: "1px solid var(--stroke)",
                background: isUser
                  ? "linear-gradient(135deg, rgba(255,77,135,0.22), rgba(255,122,168,0.18))"
                  : "rgba(255,255,255,0.55)",
                boxShadow: isUser
                  ? "0 12px 26px rgba(255,77,135,0.12)"
                  : "0 10px 24px rgba(31,41,55,0.06)",
                backdropFilter: "blur(var(--blur))",
                WebkitBackdropFilter: "blur(var(--blur))",
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--text)", whiteSpace: "pre-wrap" }}>
                {m.text}
              </div>
              <div style={{ fontSize: 12, marginTop: 6, color: "var(--subtext)" }}>{m.time}</div>
            </div>
          </div>
        );
      })}

      {botTyping && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div
            style={{
              borderRadius: 16,
              padding: "10px 12px",
              border: "1px solid var(--stroke)",
              background: "rgba(255,255,255,0.55)",
              boxShadow: "0 10px 24px rgba(31,41,55,0.06)",
              backdropFilter: "blur(var(--blur))",
              WebkitBackdropFilter: "blur(var(--blur))",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Spin size="small" />
            <div style={{ fontWeight: 700, color: "var(--text)" }}>Bot is typing...</div>
          </div>
        </div>
      )}
    </div>
  );
}