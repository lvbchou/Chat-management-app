import { Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  if (location.pathname.startsWith("/login")) return null;

  const isProfile = location.pathname.startsWith("/profile");

  const headerStyle = {
    height: 68,
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    // Pink glass
    background:
      "linear-gradient(90deg, rgba(255, 111, 165, 0.14) 0%, rgba(255, 158, 201, 0.10) 40%, rgba(255,255,255,0.40) 100%)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(255, 111, 165, 0.18)",
    boxShadow: "0 10px 22px rgba(255, 111, 165, 0.10)",

    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const brandWrapStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    userSelect: "none",
  };

  const logoStyle = {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(255, 111, 165, 0.95) 0%, rgba(255, 158, 201, 0.95) 100%)",
    boxShadow: "0 12px 20px rgba(255, 111, 165, 0.22)",
    border: "1px solid rgba(255,255,255,0.55)",
  };

  const titleStyle = {
    fontSize: 16,
    fontWeight: 900,
    color: "#111827",
    letterSpacing: 0.2,
  };

  const subTitleStyle = {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  };

  const btnStyle = {
    borderRadius: 12,
    height: 36,
    padding: "0 14px",
    boxShadow: "0 8px 18px rgba(255, 111, 165, 0.10)",
    border: "1px solid rgba(255, 111, 165, 0.20)",
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const primaryPinkBtnStyle = {
    borderRadius: 12,
    height: 36,
    padding: "0 14px",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.45)",
    background:
      "linear-gradient(135deg, rgba(255, 111, 165, 0.95) 0%, rgba(255, 158, 201, 0.95) 100%)",
    boxShadow: "0 12px 22px rgba(255, 111, 165, 0.22)",
  };

  return (
    <div style={headerStyle}>
      {}
      <div style={brandWrapStyle}>
        <div style={logoStyle}>
          <MessageOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>

        <div style={{ lineHeight: 1.1 }}>
          <div style={titleStyle}>Chat Management App</div>
          <div style={subTitleStyle}>Manage conversations seamlessly</div>
        </div>
      </div>

      {}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {isProfile ? (
          <Button style={btnStyle} onClick={() => navigate("/conversations")}>
            Conversation
          </Button>
        ) : (
          <Button style={btnStyle} onClick={() => navigate("/profile")}>
            Profile
          </Button>
        )}

        <Button
          style={primaryPinkBtnStyle}
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}