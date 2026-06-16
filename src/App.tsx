import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, RootState } from './store';
import { queryClient } from './features/models/queryClient';
import { AbilityProvider } from './context/AbilityContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppContent: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);

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
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AbilityProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AbilityProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
