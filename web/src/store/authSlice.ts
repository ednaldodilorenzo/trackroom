// authSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { loginService } from "./loginService";

type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export type User = {
  nome: string;
  email: string;
};

export type AuthState = {
  user: User | null;
  // keep optional to match selectors that may reference it
  accessToken?: string | null;
  status: AuthStatus;
  error: string | null;
};

type LoginPayload = { email: string; password: string };

// Example async login action (call your API here)
export const login = createAsyncThunk<
  // Returned value
  { user: User },
  // Thunk arg
  LoginPayload,
  // ThunkApiConfig
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await loginService.login(email, password);

    return { user: { nome: res.data.nome, email: res.data.email } };
  } catch (error) {
    const message = (error as { message?: string })?.message ?? "Login failed";
    return rejectWithValue(message);
  }
});

// Safely load an initial state from redux-persist (if present)
function loadPersistedAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem("persist:root");
    if (!raw) return null;

    // redux-persist stores slice values as JSON strings
    const root = JSON.parse(raw) as Record<string, string>;
    if (!root.auth) return null;

    const persisted = JSON.parse(root.auth) as Partial<AuthState>;
    return {
      user: persisted.user ?? null,
      accessToken: persisted.accessToken ?? null,
      status: persisted.status ?? "idle",
      error: persisted.error ?? null,
    };
  } catch {
    return null;
  }
}

const initialState: AuthState = loadPersistedAuth() ?? {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<
        { user?: User; accessToken?: string | null } | undefined
      >
    ) {
      const { user, accessToken } = action.payload ?? {};
      state.user = user ?? null;
      state.accessToken = accessToken ?? state.accessToken ?? null;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        // state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;

// Selectors (avoid importing RootState to prevent circular deps)
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) =>
  state.auth.accessToken ?? null;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.accessToken);

export default authSlice.reducer;
