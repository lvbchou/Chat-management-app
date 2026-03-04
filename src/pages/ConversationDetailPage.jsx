import {useEffect, useMemo, useRef, useState} from "react";
import {Layout, Button, Input, Spin, Empty, Modal, Form} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";

import AppHeader from "../components/AppHeader";
import ConversationFormModal from "../components/ConversationFormModal";
import MessageList from "../components/MessageList";

import {useSocket} from "../socket/useSocket";
// import {selectMyInfo} from "../store/authSlice";

import {
  fetchConversations,
  createConversation,
  addLocalConversation,
  setQuery,
  selectConversations,
  selectConversationsLoading,
  selectConversationQuery,
  updateLastBotReply,
  updateConversationName, removeConversation, //conversationSlice
} from "../store/conversationSlice";

import {appendMessage, selectMessagesByConvId} from "../store/messageSlice";
import {io} from "socket.io-client";

const {Sider, Content} = Layout;

export default function ConversationDetailPage() {
  const {id} = useParams();
  const activeId = String(id);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const myInfo = useSelector(selectMyInfo);
  const conversations = useSelector(selectConversations);
  const loading = useSelector(selectConversationsLoading);
  const query = useSelector(selectConversationQuery);

  const messages = useSelector((state) => selectMessagesByConvId(state, activeId));

  const [text, setText] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Rename modal states
  const [renameOpen, setRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameForm] = Form.useForm();

  // Delete modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const chatRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const lastUserTextRef = useRef("");

  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());

  const {onBotMessage} = useSocket();

  const nowTimeLabel = () =>
    new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  const nowMs = () => Date.now();

  const activeConv = useMemo(
    () => conversations.find((c) => String(c.id) === activeId),
    [conversations, activeId]
  );

  const titleName = activeConv?.name || `Conversation ${activeId}`;

  // Lọc client-side (tìm kiếm luôn hoạt động)
  const filteredConversations = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => String(c?.name || "").toLowerCase().includes(q));
  }, [conversations, query]);

  // theme (màu hường hihi)
  const theme = useMemo(
    () => ({
      bg: "linear-gradient(135deg, #fff1f6 0%, #ffe4f0 35%, #fff7fb 100%)",
      glass: "rgba(255, 255, 255, 0.55)",
      glassStrong: "rgba(255, 255, 255, 0.72)",
      stroke: "rgba(255, 105, 180, 0.22)",
      shadow: "0 12px 40px rgba(255, 105, 180, 0.14)",
      shadowSoft: "0 10px 30px rgba(31, 41, 55, 0.08)",
      text: "#111827",
      subText: "rgba(17, 24, 39, 0.62)",
      pink: "#ff4d87",
      pink2: "#ff7aa8",
      pinkSoft: "rgba(255, 77, 135, 0.10)",
      blur: 16,
      radius: 16,
    }),
    []
  );

  const glassPanelStyle = {
    background: theme.glass,
    border: `1px solid ${theme.stroke}`,
    borderRadius: theme.radius,
    boxShadow: theme.shadow,
    backdropFilter: `blur(${theme.blur}px)`,
    WebkitBackdropFilter: `blur(${theme.blur}px)`,
  };

  const glassPanelStrongStyle = {
    background: theme.glassStrong,
    border: `1px solid ${theme.stroke}`,
    borderRadius: theme.radius,
    boxShadow: theme.shadowSoft,
    backdropFilter: `blur(${theme.blur}px)`,
    WebkitBackdropFilter: `blur(${theme.blur}px)`,
  };

  const primaryBtnStyle = {
    height: 44,
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(135deg, ${theme.pink} 0%, ${theme.pink2} 100%)`,
    boxShadow: "0 10px 22px rgba(255, 77, 135, 0.22)",
  };

  useEffect(() => {
    const s = io("https://owlee-dev.thinklabs.com.vn", {
      path: "/socket.io/socket.io",
      transports: ["websocket"],
      query: {verify: false},
    });

    socketRef.current = s;

    s.on("chatbot_message", (data) => {
      // chỉ lấy bot trả lời hợp lệ
      if (data?.sender === "bot" && data?.type !== "follow_up_question") {
        listenersRef.current.forEach((cb) => cb(data));
      }
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  // load list
  useEffect(() => {
    dispatch(fetchConversations({page: 1, limit: 50}));
  }, [dispatch]);

  // when switching conversation
  useEffect(() => {
    setBotTyping(false);
    setText("");
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, [activeId]);

  // listen bot responses
  useEffect(() => {
    const off = onBotMessage((data) => {
      const botText = (data?.text ?? data?.message ?? "").trim();

      setBotTyping(false);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      const tLabel = nowTimeLabel();
      const tMs = nowMs();

      const finalText = botText
        ? botText
        : `Bạn vừa nhập "${lastUserTextRef.current}" chưa có thông tin`;

      dispatch(
        appendMessage({
          convId: activeId,
          message: {id: crypto.randomUUID(), from: "bot", text: finalText, time: tLabel},
        })
      );

      dispatch(updateLastBotReply({convId: activeId, lastBotReplyAt: tLabel, lastBotReplyAtMs: tMs}));
    });

    return () => off?.();
  }, [onBotMessage, dispatch, activeId]);

  // auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({top: chatRef.current.scrollHeight, behavior: "smooth"});
  }, [messages, botTyping]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;

    lastUserTextRef.current = content;

    const tLabel = nowTimeLabel();
    dispatch(
      appendMessage({
        convId: activeId,
        message: {id: crypto.randomUUID(), from: "user", text: content, time: tLabel},
      })
    );

    setBotTyping(true);

    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      setBotTyping(false);

      const fbLabel = nowTimeLabel();
      const fbMs = nowMs();

      dispatch(
        appendMessage({
          convId: activeId,
          message: {
            id: crypto.randomUUID(),
            from: "bot",
            text: `Bạn vừa nhập "${content}" chưa có thông tin`,
            time: fbLabel,
          },
        })
      );

      dispatch(updateLastBotReply({convId: activeId, lastBotReplyAt: fbLabel, lastBotReplyAtMs: fbMs}));
      fallbackTimerRef.current = null;
    }, 4000);

    const data = {
      type: "question",
      is_conversation_exists: false,
      conversation_id: "",
      text: content || "",
      is_iframe: true,
      chatbot_id: "6862181f7b95c3f0edb79f9a",
      user_info_iframe: {user_name: 'Vu'},
    };
    socketRef.current?.emit("chatbot_message", data);
    // sendToBot(content, myInfo?.name || myInfo?.username || "Vu");
    setText("");
  };

  const handleCreate = async ({name}) => {
    setCreating(true);
    try {
      const action = await dispatch(createConversation({name}));

      if (createConversation.fulfilled.match(action)) {
        setCreateOpen(false);
        navigate(`/conversations/${action.payload.id}`);
        return;
      }

      const localId = String(Date.now());
      dispatch(
        addLocalConversation({
          id: localId,
          name,
          lastBotReplyAt: "-",
          lastBotReplyAtMs: 0,
          raw: null,
        })
      );
      setCreateOpen(false);
      navigate(`/conversations/${localId}`);
    } finally {
      setCreating(false);
    }
  };

  // Rename conversation
  const openRename = (conv) => {
    setRenameTarget(conv);
    setRenameOpen(true);
    // set default value
    renameForm.setFieldsValue({name: conv?.name || ""});
  };

  // Submit rename
  const submitRename = async () => {
    try {
      const values = await renameForm.validateFields();
      const newName = String(values?.name || "").trim();
      if (!renameTarget?.id) return;

      setRenaming(true);
      dispatch(updateConversationName({id: renameTarget.id, name: newName}));

      setRenameOpen(false);
      setRenameTarget(null);
      renameForm.resetFields();
    } finally {
      setRenaming(false);
    }
  };

  const closeRename = () => {
    setRenameOpen(false);
    setRenameTarget(null);
    renameForm.resetFields();
  };

  // Delete conversation
  const openDelete = (conv) => {
    setDeleteTarget(conv);
    setDeleteOpen(true);
  };

  // Confirm delete
  const submitDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);
      dispatch(removeConversation(deleteTarget.id));

      // nếu đang xem conv đó thì quay về list
      if (String(deleteTarget.id) === activeId) {
        navigate("/conversations");
      }

      setDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // scroll list sider
  const HEADER_H = 64;
  const OUTER_PADDING = 14;
  const GAP = 14;

  const convListHeight = useMemo(() => {
    const btnH = 44;
    const btnMb = 12;
    const inputH = 40;
    const inputMb = 12;
    const panelPaddingTopBottom = 14 * 2;
    return `calc(100vh - ${HEADER_H}px - ${OUTER_PADDING * 2}px - ${btnH}px - ${btnMb}px - ${inputH}px - ${inputMb}px - ${panelPaddingTopBottom}px - 8px)`;
  }, []);

  return (
    <Layout style={{minHeight: "100vh", background: theme.bg}}>
      <AppHeader/>

      <Layout style={{background: "transparent", padding: OUTER_PADDING, gap: GAP}}>
        <Sider width={320} style={{background: "transparent", padding: 0}}>
          <div
            style={{
              ...glassPanelStyle,
              padding: 14,
              height: `calc(100vh - ${HEADER_H}px - ${OUTER_PADDING * 2}px)`,
              overflow: "hidden",
            }}
          >
            <Button
              type="primary"
              block
              onClick={() => setCreateOpen(true)}
              style={{...primaryBtnStyle, marginBottom: 12}}
            >
              + New chat
            </Button>

            <Input
              value={query}
              onChange={(e) => dispatch(setQuery(e.target.value))}
              placeholder="Search"
              style={{
                height: 40,
                borderRadius: 12,
                marginBottom: 12,
                border: `1px solid ${theme.stroke}`,
                background: "rgba(255,255,255,0.65)",
              }}
              suffix={<span style={{opacity: 0.55}}>🔍</span>}
              allowClear
            />

            {loading ? (
              <div style={{paddingTop: 18, textAlign: "center"}}>
                <Spin/>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{padding: 12}}>
                <Empty description="No conversation"/>
              </div>
            ) : (
              <div
                style={{
                  height: convListHeight,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 6,
                  scrollbarGutter: "stable",
                }}
              >
                <div style={{display: "flex", flexDirection: "column", gap: 10}}>
                  {filteredConversations.map((c) => {
                    const active = String(c.id) === activeId;

                    return (
                      <div
                        key={c.id}
                        style={{position: "relative"}}
                        onClick={() => navigate(`/conversations/${c.id}`)}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget.querySelector(".conv-actions");
                          if (el) el.style.opacity = 1;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget.querySelector(".conv-actions");
                          if (el) el.style.opacity = 0;
                        }}
                      >
                        <div
                          style={{
                            cursor: "pointer",
                            borderRadius: 14,
                            padding: 12,
                            border: `1px solid ${
                              active ? "rgba(255,77,135,0.45)" : "rgba(255,105,180,0.18)"
                            }`,
                            background: active
                              ? `linear-gradient(135deg, ${theme.pinkSoft} 0%, rgba(255,255,255,0.75) 60%)`
                              : "rgba(255,255,255,0.55)",
                            boxShadow: active ? "0 10px 24px rgba(255,77,135,0.12)" : "none",
                            backdropFilter: `blur(${theme.blur}px)`,
                            WebkitBackdropFilter: `blur(${theme.blur}px)`,
                            transition: "all 160ms ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                color: theme.text,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {c.name}
                            </div>

                            <div
                              className="conv-actions"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: "flex",
                                gap: 8,
                                opacity: 0,
                                transition: "opacity 160ms ease",
                                flexShrink: 0,
                              }}
                            >
                              <button
                                type="button"
                                title="Rename"
                                onClick={() => openRename(c)}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 10,
                                  border: `1px solid ${theme.stroke}`,
                                  background: "rgba(255,255,255,0.7)",
                                  cursor: "pointer",
                                }}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                onClick={() => openDelete(c)}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 10,
                                  border: "1px solid rgba(255, 0, 80, 0.18)",
                                  background: "rgba(255,255,255,0.7)",
                                  cursor: "pointer",
                                }}
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <div style={{fontSize: 12, color: theme.subText, marginTop: 2}}>
                            Updated: {c.lastBotReplyAt || "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Sider>

        <Content style={{background: "transparent"}}>
          <div style={{...glassPanelStrongStyle, overflow: "hidden"}}>
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: `1px solid ${theme.stroke}`,
                background: "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,240,248,0.55))",
              }}
            >
              <div style={{fontWeight: 900, fontSize: 16, color: theme.text}}>{titleName}</div>
            </div>

            <div
              ref={chatRef}
              style={{
                height: "calc(100vh - 64px - 14px - 14px - 56px - 72px)",
                overflow: "auto",
                padding: "18px 22px",
                background:
                  "radial-gradient(900px 420px at 20% 0%, rgba(255,77,135,0.09), rgba(255,255,255,0) 60%), rgba(255,255,255,0.40)",
                backdropFilter: `blur(${theme.blur}px)`,
                WebkitBackdropFilter: `blur(${theme.blur}px)`,
              }}
            >
              <MessageList messages={messages} botTyping={botTyping}/>
            </div>

            <div
              style={{
                borderTop: `1px solid ${theme.stroke}`,
                padding: 14,
                display: "flex",
                gap: 12,
                background: "linear-gradient(135deg, rgba(255,240,248,0.72), rgba(255,255,255,0.55))",
                backdropFilter: `blur(${theme.blur}px)`,
                WebkitBackdropFilter: `blur(${theme.blur}px)`,
              }}
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your message"
                onPressEnter={handleSend}
                style={{
                  height: 46,
                  borderRadius: 14,
                  border: `1px solid ${theme.stroke}`,
                  background: "rgba(255,255,255,0.75)",
                }}
              />
              <Button
                type="primary"
                onClick={handleSend}
                style={{...primaryBtnStyle, height: 46, width: 120}}
                loading={botTyping}
              >
                Send
              </Button>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Create chat */}
      <ConversationFormModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={creating}
      />

      {/* Rename chat */}
      <Modal
        title="Rename chat"
        open={renameOpen}
        onCancel={closeRename}
        onOk={submitRename}
        confirmLoading={renaming}
        okText="Save"
        cancelText="Cancel"
        centered
      >
        <Form form={renameForm} layout="vertical">
          <Form.Item
            label="Conversation name"
            name="name"
            rules={[
              {required: true, message: "Please enter conversation name"},
              {whitespace: true, message: "Name cannot be empty"},
            ]}
          >
            <Input placeholder="Type new name..." style={{height: 44, borderRadius: 12}}/>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete chat*/}
      <Modal
        title="Delete chat"
        open={deleteOpen}
        onCancel={closeDelete}
        onOk={submitDelete}
        confirmLoading={deleting}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        centered
      >
        <div style={{lineHeight: 1.6}}>
          Are you sure you want to delete{" "} ?
          <b>{deleteTarget?.name || "this conversation"}</b>?
          <div style={{marginTop: 8, opacity: 0.7}}>
            This action cannot be undone.
          </div>
        </div>
      </Modal>
    </Layout>
  );
}