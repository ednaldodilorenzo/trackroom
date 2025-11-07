import { Requester, request } from "@/utils/requester";
import { type AxiosInstance } from "axios";

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

  login(usuario: string, senha: string) {
    return this.post<LoginResponse, LoginRequest>({
      email: usuario,
      senha: senha,
    });
  }
}

export const authService = new AuthService(request);
