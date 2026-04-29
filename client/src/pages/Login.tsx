import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login"
      ? { email, password }
      : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "發生錯誤，請再試一次");
        return;
      }

      setLocation("/");
    } catch {
      setError("網路錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          🎵 絕技長笛 RPG
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          {mode === "login" ? "登入你的帳號" : "建立新帳號"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-sm text-gray-300 block mb-1">名稱</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="你的名稱"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === "register" ? "至少 8 個字元" : "••••••••"}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "處理中…" : mode === "login" ? "登入" : "註冊"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? "還沒有帳號？" : "已有帳號？"}
          {" "}
          <button
            className="text-yellow-400 hover:underline"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "立即註冊" : "去登入"}
          </button>
        </p>
      </div>
    </div>
  );
}
