import React from "react";
import Navbar from "@/components/Navbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <>
  <Navbar/>
  {children}</>;
};

export default DashboardLayout;
