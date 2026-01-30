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

export type SignupRequest = {
  name: string;
  cpf: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
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
        store.dispatch(setCredentials(usuario));
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

  signup = (data: SignupRequest) =>
    this.post<void, SignupRequest>(data, {}, "/auth/v1/signup")
      .then(() => {
        return true;
      })
      .catch((err) => {
        console.error("Signup failed:", err);
        return false;
      })

  emailAvailable = (email: string) =>
    this.get<boolean>("", {}, `/auth/v1/availability/email/${encodeURIComponent(email)}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Email availability check failed:", err);
        return false;
      })

  usernameAvailable = (username: string) =>
    this.get<boolean>("", {}, `/auth/v1/availability/username/${encodeURIComponent(username)}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Username availability check failed:", err);
        return false;
      })

  cpfAvailable = (cpf: string) =>
    this.get<boolean>("", {}, `/auth/v1/availability/cpf/${encodeURIComponent(cpf)}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("CPF availability check failed:", err);
        return false;
      })

  confirmSignup = (code: string, token: string) =>
    this.post<void, string>(code, {
      headers: {
        'Content-Type': 'text/plain'
      }
    }, `/auth/v1/confirm/${encodeURIComponent(token)}`)
      .then(() => {
        return true;
      })
      .catch((err) => {
        console.error("Signup confirmation failed:", err);
        return false;
      })
}

export const authService = new AuthService(request);
