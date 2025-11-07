// requireAuthLoader.js
import { redirect } from "react-router-dom";
import { store } from "@/store";

export async function requireAuthLoader({ request }: any) {
  const { user } = store.getState().auth || {};
  if (!user) {
    const url = new URL(request.url);
    const from = url.pathname + url.search;
    return redirect("/login?from=" + encodeURIComponent(from));
  }
  return null; // let children proceed
}
