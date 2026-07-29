import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import Footer from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-vh-100 bg-body text-body d-flex flex-column">
      <NavigationBar />
      <main className="flex-shrink-0 my-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
