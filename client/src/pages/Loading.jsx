import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Loading() {
  const navigate = useNavigate();
  const { fetchUser } = useAppContext();
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUser();
      navigate("/");
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="bg-gradient-to-b from-[#531B81] to-[#29184B] backdrop-opacity-50 flex items-center justify-center h-screen w-screen text-white text-2xl">
      <div className="w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
    </div>
  );
}
