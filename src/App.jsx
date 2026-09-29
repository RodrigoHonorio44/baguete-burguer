import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
          <div>
            <Navbar />
            <main>
              <AppRoutes />
            </main>
          </div>
          <CartDrawer />
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
            © baguete burguer - todos os direitos reservados. qualidade e sabor em cada mordida.
          </footer>
        </div>
        
        {/* Configuração global do Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#090d16',
              color: '#f8fafc',
              border: '1px solid #1e293b',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#090d16',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#090d16',
              },
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  );
}