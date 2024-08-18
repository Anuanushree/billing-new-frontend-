import { Dashboard } from "@mui/icons-material";
import React from "react";
import { Outlet } from "react-router-dom";
import AdminDashboard from "./Admindashboard/AdminDashboard";

function Home() {
  return (
    <div>
      <AdminDashboard />
    </div>
  );
}

export default Home;
