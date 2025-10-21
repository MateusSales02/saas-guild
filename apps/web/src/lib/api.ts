import axios from "axios";
import { setSession } from "@/stores/auth";

const api = axios.create({
  baseURL: "http://localhost:3000", // ajuste se você usar /api no Nest
});

export const AuthApi = {
  async login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    setSession(token, user); // salva na store
    return res.data;
  },

  async register(email: string, password: string, nickname: string, role: string) {
    const res = await api.post("/auth/register", {
      email,
      password,
      nickname,
      role,
    });
    const { token, user } = res.data;
    setSession(token, user); // salva na store
    return res.data;
  },
};

// helper genérico para POST JSON
export async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await api.post(url, body, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}
