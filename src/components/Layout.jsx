import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * A shared layout component that includes the Navbar and Footer.
 * The <Outlet /> component from react-router-dom will render the 
 * specific page component for the current matched route.
 */
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        {/* The content of your page components (e.g., ShopPage, Contact) will be rendered here */}
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
}

