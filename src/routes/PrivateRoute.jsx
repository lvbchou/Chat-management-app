import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectMyInfo } from "../store/authSlice";

export default function PrivateRoute({ children }) {
  const myInfo = useSelector(selectMyInfo);
  if (!myInfo) return <Navigate to="/login" replace />;
  return children;
}