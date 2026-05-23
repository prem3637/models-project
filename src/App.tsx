import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from './features/models/queryClient';
import { AbilityProvider } from './context/AbilityContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AbilityProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AbilityProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
