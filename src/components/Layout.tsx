import React from 'react';
import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NavigationBar from './NavigationBar';
import Footer from './Footer';

export const Layout: React.FC = () => {
  return (
    <HelmetProvider>
      <div className="d-flex flex-column min-vh-100 custom-layout">
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
