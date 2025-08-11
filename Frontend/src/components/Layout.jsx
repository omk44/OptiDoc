import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 sm:px-8 md:px-16 py-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
