import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './routes/index.routes'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <Router />

    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '12px',
          fontSize: '14px',
          padding: '14px 18px',
          marginTop: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        },

        success: {
          style: {
            background: '#16a34a',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#16a34a',
          },
        },

        error: {
          style: {
            background: '#dc2626',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#dc2626',
          },
        },

      }}
    />

  </StrictMode>,
)