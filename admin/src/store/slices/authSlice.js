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
            state.error = null
            state.isLoading = false
        },
        setAuthFailure(state, action) {
            state.error = action.payload
            if (action.payload) {
                state.isAuthenticated = false
                state.user = null
            }
            state.isLoading = false
        },
        clearAuth(state) {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            state.isLoading = false
        },
        setUser(state, action) {
            state.user = action.payload
        },
    },
})

export const { setAuthLoading, setAuthSuccess, setAuthFailure, clearAuth, setUser } = authSlice.actions

export default authSlice.reducer

