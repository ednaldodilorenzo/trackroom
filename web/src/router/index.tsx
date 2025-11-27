import { lazy, Suspense } from "react";
import { Main, FallbackOverlay } from "@/components";
import { createBrowserRouter } from "react-router-dom";
import { requireAuthLoader } from "@/modules/auth/requireAuthLoader";

const Login = lazy(() => import("@/modules/auth/Login"));
const Home = lazy(() => import("@/modules/home/Home"));
const GroupAdd = lazy(() => import("@/modules/group/GroupAdd"));
const MusicList = lazy(() => import("@/modules/music/MusicList"));
const MusicAdd = lazy(() => import("@/modules/music/MusicAdd"));
const MusicCipher = lazy(() => import("@/modules/music/MusicCipher"));

export const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
      action: async (args) => {
        const mod = await import("@/modules/auth/Login");
        return mod.action(args);
      },
    },
    {
      path: "/home",
      element: <Main />,
      //errorElement: <Error />,
      loader: requireAuthLoader,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<FallbackOverlay />}>
              <Home />
            </Suspense>
          ),
          loader: async () => {
            const mod = await import("@/modules/home/Home");
            return mod.groupsLoader();
          },
        },
        {
          path: "groups/add",
          element: <GroupAdd />,
          action: async (args) => {
            const mod = await import("@/modules/group/GroupAdd");
            return mod.action(args);
          },
        },
        {
          path: "groups/:id/musics",
          element: <MusicList />,
          loader: async (args) => {
            const mod = await import("@/modules/music/MusicList");
            return mod.musicsLoader(args);
          },
        },
        {
          path: "groups/:id/musics/add",
          element: <MusicAdd />,
          action: async (args) => {
            const mod = await import("@/modules/music/MusicAdd");
            return mod.action(args);
          },
        },
        {
          path: "groups/:id/musics/:musicId/cipher",
          element: <MusicCipher />,          
        },
      ],
    },
  ],
  {
    future: {
      v8_middleware: true,
    },
  }
);
