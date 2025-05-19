
import React from "react";
import Navbar from "./Navbar";
import { UserProvider } from "@/context/UserContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <UserProvider>
      <div className="min-h-screen bg-finance-gray-light">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </UserProvider>
  );
};

export default Layout;
