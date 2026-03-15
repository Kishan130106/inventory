// store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit'

const stored = localStorage.getItem('psg_theme') || 'dark'

// Apply class to <html> immediately on load
document.documentElement.className = stored

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: stored },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      document.documentElement.className = state.mode
      localStorage.setItem('psg_theme', state.mode)
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      document.documentElement.className = state.mode
      localStorage.setItem('psg_theme', state.mode)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
export const selectTheme = (s) => s.theme.mode
