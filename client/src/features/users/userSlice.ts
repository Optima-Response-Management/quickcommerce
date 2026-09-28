import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { mockUsers } from "./mockUsers";
import type { Feature } from "./access";
import type { ManagedUser, PlatformAccess } from "./types";

interface UsersState {
  list: ManagedUser[];
}

const initialState: UsersState = { list: mockUsers };

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<ManagedUser>) => {
      state.list.unshift(action.payload);
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
    },
    updateAccess: (
      state,
      action: PayloadAction<{
        id: string;
        platformAccess: PlatformAccess;
        platforms: string[];
        features: Feature[];
      }>
    ) => {
      const user = state.list.find((u) => u.id === action.payload.id);
      if (user) {
        user.platformAccess = action.payload.platformAccess;
        user.platforms = action.payload.platforms;
        user.features = action.payload.features;
      }
    },
  },
});

export const { addUser, deleteUser, updateAccess } = usersSlice.actions;
export default usersSlice.reducer;