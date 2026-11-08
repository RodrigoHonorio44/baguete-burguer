import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { AppRoutes } from './routes/AppRoutes';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        {/* Container Principal com largura 100% fluida (w-full) */}
        <div className="min-h-screen w-full bg-white text-slate-800 flex flex-col justify-between relative overflow-x-hidden">
          <div className="w-full">
            <Navbar />
            <main className="w-full">
              <AppRoutes />
            </main>
          </div>
          
          <CartDrawer />
          <WhatsAppButton />
          <Footer />
        </div>
        
        {/* Configuração global do Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  );
}