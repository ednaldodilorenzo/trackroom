import { type User } from "./User";

interface JoinGroupRequest {
    id: number;
    user: User;
    status: string;
}

export type { JoinGroupRequest };