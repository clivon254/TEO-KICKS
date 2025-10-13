import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state, action) {
      state.isLoading = action.payload
    },
    setAuthSuccess(state, action) {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    setAuthFailure(state, action) {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    setUser(state, action) {
      state.user = action.payload
    },
  },
})


export const { setAuthLoading, setAuthSuccess, setAuthFailure, clearAuth, setUser } = authSlice.actions

export default authSlice.reducer
