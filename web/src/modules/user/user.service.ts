import type { User } from "@/model";
import { Requester, request } from "@/utils/requester";
import { type AxiosInstance } from "axios";

class UserService extends Requester {
    constructor(instance: AxiosInstance) {
        super(instance, "/v1/users");
    }

    findAllByUsername = (username: string): Promise<User[]> => this.get<User[]>("", { username: username }).then(resp => resp.data);
}

export const userService = new UserService(request);
