// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const TOKEN_KEY = 'psg_token'
const USER_KEY  = 'psg_user'

const storedToken = localStorage.getItem(TOKEN_KEY)
const storedUser  = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: storedToken || null,
    user:  storedUser  || null,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload
      state.token = token
      state.user  = user
      state.error = null
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    setLoading: (state, action) => { state.loading = action.payload },
    setError:   (state, action) => { state.error   = action.payload; state.loading = false },
    logout: (state) => {
      state.token = null
      state.user  = null
      state.error = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})

export const { setCredentials, setLoading, setError, logout } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectToken   = (s) => s.auth.token
export const selectUser    = (s) => s.auth.user
export const selectIsAuth  = (s) => !!s.auth.token
export const selectLoading = (s) => s.auth.loading
