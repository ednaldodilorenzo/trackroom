import { lazy, Suspense } from "react";
import { Main, FallbackOverlay } from "@/components";
import { createBrowserRouter } from "react-router-dom";
import { GroupProvider } from "@/modules/group/GroupContext";
import Confirmation from "@/modules/auth/signup/Confirmation";


const Login = lazy(() => import("@/modules/auth/login/Login"));
const Signup = lazy(() => import("@/modules/auth/signup/Signup"));
const Home = lazy(() => import("@/modules/home/Home"));
const GroupAdd = lazy(() => import("@/modules/group/GroupAdd"));
const GroupData = lazy(() => import("@/modules/group/GroupData"));
const MusicList = lazy(() => import("@/modules/music/MusicList"));
const MusicAdd = lazy(() => import("@/modules/music/MusicAdd"));
const MusicCipher = lazy(() => import("@/modules/music/MusicCipher"));
const GroupAddMember = lazy(() => import("@/modules/group/GroupAddMember"));
const GroupInfo = lazy(() => import("@/modules/group/GroupInfo"));
const ForgotPassword = lazy(() => import("@/modules/auth/password-recover/ForgotPassword"));
const PasswordReset = lazy(() => import("@/modules/auth/password-recover/PasswordReset"));
const GroupHome = lazy(() => import("@/modules/group/GroupHome"));
const PlaylistAdd = lazy(() => import("@/modules/playlist/PlaylistAdd"));
const PlayListList = lazy(() => import("@/modules/playlist/PlaylistList"));
const PlaylistDetail = lazy(() => import("@/modules/playlist/PlaylistDetail"));
const PlayListAddSong = lazy(() => import("@/modules/playlist/PlayListAddSong"));
const SignupConfirm = lazy(() => import("@/modules/auth/signup/SignupConfirm"));
const GroupSearch = lazy(() => import("@/modules/group/GroupSearch"));

export const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
      action: async (args) => {
        const mod = await import("@/modules/auth/login/Login");
        return mod.action(args);
      },
    },
    {
      path: "/signup",
      element: <Signup />,
      // action: async (args) => {
      //   const mod = await import("@/modules/auth/signup/Signup");
      //   return mod.action(args);
      // }
    },
    {
      path: "/signup-confirm",
      element: <SignupConfirm />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/password-reset/:token",
      element: <PasswordReset />,
    },
    {
      path: "/confirm/:token",
      element: <Confirmation />,
    },
    {
      path: "/",
      element: <Main />,
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
          path: "groups/search",
          element: <GroupSearch />,
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
          path: "groups/:id",
          element: (
            <GroupProvider>
              <GroupData />
            </GroupProvider>
          ),
          loader: async (args) => {
            const mod = await import("@/modules/group/GroupData");
            return mod.groupLoader(args);
          },
          children: [
            {
              path: "home",
              element: <GroupHome />,
              loader: async (args) => {
                const mod = await import("@/modules/group/GroupHome.loader");
                return mod.loader(args);
              },
            },
            {
              path: "edit",
              element: <GroupAdd />,
              action: async (args) => {
                const mod = await import("@/modules/group/GroupAdd");
                return mod.action(args);
              },
            },
            {
              path: "musics",
              element: <MusicList />,
              loader: async (args) => {
                const mod = await import("@/modules/music/MusicList");
                return mod.musicsLoader(args);
              },
            },
            {
              path: "musics/add",
              element: <MusicAdd />,
              loader: async (args) => {
                const mod = await import("@/modules/music/MusicAdd");
                return mod.load(args);
              }
            },
            {
              path: "musics/:musicId",
              element: <MusicAdd />,
              loader: async (args) => {
                const mod = await import("@/modules/music/MusicAdd");
                return mod.load(args);
              }
            },
            {
              path: "musics/:musicId/cipher",
              element: <MusicCipher />,
              loader: async (args) => {
                const mod = await import("@/modules/music/MusicCipher");
                return mod.cipherLoader(args);
              },
              action: async (args) => {
                const mod = await import("@/modules/music/MusicCipher");
                return mod.action(args);
              },
            },
            {
              path: "playlists",
              element: <PlayListList />,
              loader: async (args) => {
                const mod = await import("@/modules/playlist/PlaylistList");
                return mod.loader(args);
              },
            },
            {
              path: "playlists/add",
              element: <PlaylistAdd />,
              action: async (args) => {
                const mod = await import("@/modules/playlist/PlaylistAdd");
                return mod.action(args);
              },
            },
            {
              path: "playlists/:playlistId",
              element: <PlaylistDetail />,
              loader: async (args) => {
                const mod = await import("@/modules/playlist/PlaylistDetail");
                return mod.loader(args);
              },
            },
            {
              path: "playlists/:playlistId/add-songs",
              element: <PlayListAddSong />,
              loader: async (args) => {
                const mod = await import("@/modules/playlist/PlayListAddSong");
                return mod.loader(args);
              },
            },
            {
              path: "info",
              element: <GroupInfo />,
              loader: async (args) => {
                const mod = await import("@/modules/group/GroupInfo");
                return mod.loader(args);
              },
            },
            {
              path: "members/add",
              element: <GroupAddMember />,
            }
          ],
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
