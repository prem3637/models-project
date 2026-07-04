import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ReduxProvider from './redux/Provider';
import { useAppSelector } from './redux/hooks';
import { useCurrentUserDataQuery } from './redux/services/auth';
import { AbilityProvider } from './context/AbilityContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppContent: React.FC = () => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const token = useAppSelector((state) => state.auth.token);

  // Automatically fetch latest profile info when token is present
  useCurrentUserDataQuery(undefined, { skip: !token });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <AppRoutes />;
};

function App() {
  return (
    <ReduxProvider>
      <AbilityProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster position="top-right" reverseOrder={false} />
        </BrowserRouter>
      </AbilityProvider>
    </ReduxProvider>
  );
}

export default App;
