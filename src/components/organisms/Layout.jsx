import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuToggle={handleMenuToggle}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet context={{ searchValue }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;