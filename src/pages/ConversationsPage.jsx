import { useEffect, useMemo, useState } from "react";
import { Layout, Input, Spin, Empty, Button, message as antdMsg } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import ConversationFormModal from "../components/ConversationFormModal";

import {
  fetchConversations,
  createConversation,
  addLocalConversation,
  setQuery,
  selectConversations,
  selectConversationsLoading,
  selectConversationQuery,
} from "../store/conversationSlice";

const { Sider, Content } = Layout;

export default function ConversationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const conversations = useSelector(selectConversations);
  const loading = useSelector(selectConversationsLoading);
  const query = useSelector(selectConversationQuery);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations({ page: 1, limit: 50, q: query || undefined }));
  }, [dispatch, query]);

  const list = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) =>
      (c.name || "").toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const handleCreate = async ({ name }) => {
    setCreating(true);
    try {
      const action = await dispatch(createConversation({ name }));

      if (createConversation.fulfilled.match(action)) {
        antdMsg.success("Create conversation successfully");
        setOpen(false);
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

      antdMsg.warning("Chưa có API create, đã thêm tạm trên UI");
      setOpen(false);
      navigate(`/conversations/${localId}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-white">
      <AppHeader />

      <Layout>
        <Sider
          width={320}
          className="bg-white border-r border-gray-200 p-4"
        >
          <Button
            type="primary"
            block
            onClick={() => setOpen(true)}
            className="h-[42px] rounded-lg mb-3"
          >
            + New chat
          </Button>

          <Input
            value={query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
            placeholder="Search"
            className="h-[36px] rounded-lg mb-3"
            suffix={<span className="opacity-50">🔍</span>}
            allowClear
          />

          {loading ? (
            <div className="pt-6 text-center">
              <Spin />
            </div>
          ) : list.length === 0 ? (
            <Empty description="Không có conversation" />
          ) : (
            <div className="flex flex-col gap-2.5">
              {list.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/conversations/${c.id}`)}
                  className="border border-gray-200 rounded-[10px] p-3 cursor-pointer bg-white hover:bg-gray-50 transition"
                >
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs opacity-70">
                    Cập nhật: {c.lastBotReplyAt || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Sider>

        <Content className="bg-white">
          <div className="p-4 text-gray-400">
            Select a conversation from the left panel
          </div>
        </Content>
      </Layout>

      <ConversationFormModal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        confirmLoading={creating}
      />
    </Layout>
  );
}