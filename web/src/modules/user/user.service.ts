import type { User } from "@/model";
import { Requester, request } from "@/utils/requester";
import { type AxiosInstance } from "axios";

class UserService extends Requester {
    constructor(instance: AxiosInstance) {
        super(instance, "/v1/users");
    }

    findAllNotInGroupByTerm = (groupId: string, term: string): Promise<User[]> => this.get<User[]>("", { search: term, groupId: groupId }).then(resp => resp.data);
}

export const userService = new UserService(request);
