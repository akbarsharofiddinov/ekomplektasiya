/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Input, Button, Form, Alert } from "antd";
import {
  LucideBuilding2,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { axiosAPI } from "@/services/axiosAPI";
import logo from "@/assets/hudud_logo.png"

// UTF-8 safe Base64 encoding
function btoaUTF8(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const basicAuth = btoaUTF8(`${values.username}:${values.password}`);
      const response = await axiosAPI.get("jwt_auth/", {
        headers: { Authorization: `Basic ${basicAuth}` },
      });

      if (response.data?.token) {
        localStorage.setItem("eEquipmentM@rC", response.data.token);
        navigate("/");
      } else {
        setErrorMsg("Noto‘g‘ri javob. Iltimos qayta urinib ko‘ring.");
      }
    } catch (err) {
      const e = err as AxiosError<any>;
      if (e.response?.status === 401) {
        setErrorMsg("Login yoki parol noto‘g‘ri.");
      } else {
        setErrorMsg("Kirishda xatolik yuz berdi. Qayta urinib ko‘ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-[960px] grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-xl border border-slate-200 bg-white">
        {/* Brand / Illustration side */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#1E56A0] to-[#1E56A0]/80 p-8 text-white">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex p-[2px] rounded-2xl bg-gradient-to-br from-[#1E56A0] via-[#2B7CD3] to-[#57CC99] shadow-lg shadow-black/10">
              <span className="flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm p-2.5">
                <img src={logo} alt="logo" className="w-9 h-9 drop-shadow-sm object-cover" />
              </span>
            </span>
            <div className="font-semibold text-lg">EKomplektatsiya</div>
          </div>
          <div className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold leading-snug">
              Ombor va mahsulotlar boshqaruvi
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Tizimga kiring va ombor, mahsulot qoldiqlari hamda hujjatlarni
              samarali boshqaring.
            </p>
          </div>
          <div className="text-xs text-white/80">
            © {new Date().getFullYear()} EKomplektatsiya
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 md:p-10">
          <div className="flex md:hidden items-center gap-3 mb-6">
            <span className="bg-[#1E56A0] p-3 rounded-xl">
              <LucideBuilding2 size={24} color="white" />
            </span>
            <div className="font-semibold text-lg text-slate-800">EKomplektatsiya</div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Tizimga kirish</h1>
            <p className="text-slate-500 text-sm mt-1">
              Login va parolingizni kiriting
            </p>
          </div>

          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Login"
              name="username"
              rules={[{ required: true, message: "Loginni kiriting" }]}
            >
              <Input
                size="large"
                prefix={<UserIcon size={16} className="text-slate-400 mr-1" />}
                placeholder="username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="Parol"
              name="password"
              rules={[{ required: true, message: "Parolni kiriting" }]}
            >
              <Input.Password
                size="large"
                prefix={<Lock size={16} className="text-slate-400 mr-1" />}
                placeholder="parol"
                autoComplete="current-password"
              />
            </Form.Item>

            {/* <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">
                Parolingizni unutingizmi?
              </span>
            </div> */}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full bg-[#2A5DA4] hover:!bg-[#1E56A0]/90"
            >
              Kirish
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
