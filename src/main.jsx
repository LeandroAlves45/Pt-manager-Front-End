import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App.jsx';

/**
 * Entry point da aplicação.
 *
 * - BrowserRouter: Fornece o sistema de routing (react-router-dom)
 *   Envolve toda a app para que qualquer componente possa usar
 *   useNavigate, useLocation, Link, etc.
 *
 * - ToastContainer: Renderiza as notificações toast (react-toastify)
 *   Configurado com tema dark para combinar com o design.
 *   Qualquer componente pode chamar toast.success(), toast.error(), etc.
 *
 * - StrictMode: Ativa verificações adicionais em desenvolvimento
 *   (renderiza componentes duas vezes para detetar side-effects)
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  </React.StrictMode>
);
