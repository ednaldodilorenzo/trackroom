import { redirect } from "react-router-dom";
import { store } from "../store";

type MiddlewareArgs = {
  context?: unknown;
  next: () => Promise<Response | undefined>;
};

export async function authMiddlewareHandler({ next }: MiddlewareArgs) {
  const { user } = store.getState().auth || {};
  if (!user) {
    return redirect("/login");
  }

  return next();
}

export const authMiddleware = [authMiddlewareHandler];
