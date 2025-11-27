// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;      
    },
    logout: (state) => {
      state.user = null;      
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
