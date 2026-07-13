// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalProvider } from './context/GlobalContext';
import ScrollToTop from './utils/scrolltop';
import App from './App.jsx';
import { SnackbarProvider } from 'notistack';
import { GlobalStyles } from './styles/GlobalStyles';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalStyles />
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
      <GlobalProvider>
        <AuthProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <ScrollToTop />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <App />
          </SnackbarProvider>
        </GoogleOAuthProvider>
        </AuthProvider>
      </GlobalProvider>
    </Router>
  </React.StrictMode>
);