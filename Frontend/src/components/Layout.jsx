import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="min-h-screen px-4 sm:px-8 md:px-16 py-8">
        <Outlet />
      </main>
      {!hideNavbar && <Footer />}
    </>
  );
};

export default Layout;
