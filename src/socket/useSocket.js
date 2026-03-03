import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());

  useEffect(() => {
    const s = io("https://owlee-dev.thinklabs.com.vn", {
      path: "/socket.io/socket.io",
      transports: ["websocket"],
      query: { verify: false },
    });

    socketRef.current = s;

    s.on("chatbot_message", (data) => {
      // chỉ lấy bot trả lời hợp lệ
      if (data?.sender === "bot" && data?.type !== "follow_up_question") {
        listenersRef.current.forEach((cb) => cb(data));
      }
    });

    return () => {
      try {
        s.removeAllListeners();
        s.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, []);

  const sendToBot = (text, userName = "Vu") => {
    const payload = {
      type: "question",
      is_conversation_exists: "new",
      conversation_id: "new",
      text: text || "",
      is_iframe: true,
      chatbot_id: "6862181f7b95c3f0edb79f9a",
      user_info_iframe: { user_name: userName },
    };

    socketRef.current?.emit("chatbot_message", payload);
  };

  const onBotMessage = (cb) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  };

  return { sendToBot, onBotMessage };
}