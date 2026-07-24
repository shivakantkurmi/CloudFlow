import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { App } from './App.jsx';
import { store } from './store/store.js';
import { ThemeProvider } from './hooks/useTheme.jsx';
import './styles/index.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
            toastStyle={{ borderRadius: '12px', fontSize: '0.875rem' }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

