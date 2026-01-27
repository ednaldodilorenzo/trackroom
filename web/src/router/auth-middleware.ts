import { redirect } from "react-router-dom";
import { useSelector } from "react-redux";

async function authMiddleware() {
    const { user } = useSelector((state: any) => state.auth);
    if (!user) {
        throw redirect("/login");
    }
}

export default authMiddleware;