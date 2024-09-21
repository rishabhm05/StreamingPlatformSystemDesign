import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Context from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(

  <GoogleOAuthProvider clientId='213728720951-u2aqgj2i7e0f97j7i0491j9f0gig0otr.apps.googleusercontent.com'>
  
    <Context>
    <App />
    </Context>
  
  </GoogleOAuthProvider>
)
