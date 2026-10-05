import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "../users/types";
import type { Feature } from "../users/access";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  platformAccess: string;
  platforms: string[];
  features: Feature[];
}

interface AuthState {
  user: AuthUser | null;
  checking: boolean;
}

const initialState: AuthState = {
  user: null,
  checking: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.user = action.payload.user;
      state.checking = false;
    },
    logout: (state) => {
      state.user = null;
      state.checking = false;
    },
    sessionChecked: (state) => {
      state.checking = false;
    },
  },
});

export const { setCredentials, logout, sessionChecked } = authSlice.actions;
export default authSlice.reducer;