// src/modules/auth/authSevice.ts
import { Requester, request } from "@/utils/requester";
import { type AxiosInstance } from "axios";
import { store } from "@/store";
import { setCredentials, logout } from "@/store/authSlice";

export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  token: string;
};

class AuthService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/auth/v1/login");
  }

  login = (usuario: string, senha: string) =>
    this.post<LoginResponse, LoginRequest>({
      email: usuario,
      senha: senha,
    })
      .then((res) => {
        const usuario = res.data;
        store.dispatch(setCredentials({ user: usuario }));
        return true;
      })
      .catch((err) => {
        console.error("Login failed:", err);
        return false;
      });

  logout = () =>
    this.post<string, string>("", {}, "/auth/v1/logout")
      .then(() => {
        store.dispatch(logout());
        return true;
      })
      .catch((err) => {
        console.error("Logout failed:", err);
        return false;
      });
}

export const authService = new AuthService(request);
