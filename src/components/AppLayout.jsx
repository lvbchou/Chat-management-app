import { Layout, Button, Space } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMyInfo } from "../store/authSlice";

const { Header, Content } = Layout;

export default function AppLayout({ children, rightExtra }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(clearMyInfo());
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontWeight: 600 }}>Chat Management App</div>
        <Space>
          {rightExtra}
          <Button onClick={() => navigate("/profile")}>Profile</Button>
          <Button danger onClick={logout}>
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: 16 }}>{children}</Content>
    </Layout>
  );
}