import { Card } from "antd";
import { useSelector } from "react-redux";
import { selectMyInfo } from "../store/authSlice";
import AppHeader from "../components/AppHeader";

export default function ProfilePage() {
  const me =
    useSelector(selectMyInfo) || {
      name: "f",
      email: "f@gmail.com",
      role: "admin",
    };

  return (
    <div className="pink-bg min-h-screen">
      <AppHeader />

      <div className="min-h-[calc(100vh-64px)] grid place-items-center p-5">
        <Card
          className="glass w-[520px] text-center pt-2"
          style={{ borderRadius: 22 }}
        >
          <div className="grid place-items-center mb-3">
            <div
              className="w-[72px] h-[72px] rounded-[26px] grid place-items-center text-white text-[28px]"
              style={{
                background:
                  "linear-gradient(135deg, var(--pink-500), var(--pink-400))",
                boxShadow: "0 14px 28px rgba(255,77,135,0.22)",
              }}
            >
              👤
            </div>
          </div>

          <div
            className="overflow-hidden rounded-[16px]"
            style={{
              border: "1px solid var(--stroke)",
              background: "rgba(255,255,255,0.55)",
            }}
          >
            <Row label="Name" value={me.name} />
            <DividerLine />
            <Row label="Email" value={me.email} />
            <DividerLine />
            <Row label="Role" value={me.role} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_1fr] text-left">
      <div className="px-4 py-3 font-bold text-[var(--subtext)]">
        {label}
      </div>
      <div className="px-4 py-3 font-bold">
        {value || "-"}
      </div>
    </div>
  );
}

function DividerLine() {
  return (
    <div
      className="h-[1px]"
      style={{ background: "rgba(255,105,180,0.16)" }}
    />
  );
}