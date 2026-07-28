import React from 'react';
import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NavigationBar from './NavigationBar';
import Footer from './Footer';

export const Layout: React.FC = () => {
  return (
    <HelmetProvider>
      <div className="min-vh-100 bg-body text-body d-flex flex-column">
        <NavigationBar />
        <main className="flex-shrink-0 my-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Layout;
