import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store/index'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1b',
              color: '#e8e7e5',
              border: '1px solid #2a2a2b',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#c8a84b', secondary: '#0e0e0f' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0e0e0f' } },
          }}
        />
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
