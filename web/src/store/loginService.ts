import { Requester, request } from "../utils/requester";
import { type AxiosInstance } from "axios";

export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  nome: string;
  email: string;
};

class LoginService extends Requester {
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

export const loginService = new LoginService(request);
