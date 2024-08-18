import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [profile, setProfile] = useState({ username: "Admin" }); // Example profile state
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    navigate("/");
  };

  const isActive = (path) => {
    return window.location.pathname === path ? "active" : "";
  };

  return (
    <div id="app-container" className="clearfix">
      <div id="sidebar">
        <div className="sidebar-brand">
          <span>Admin Dashboard</span>
        </div>
        <ul className="sidebar-nav">
          <li className={`nav-item ${isActive("/admin/inward")}`}>
            <NavLink className="nav-link" to="/admin/inward">
              Inward
            </NavLink>
          </li>
          <li className={`nav-item ${isActive("/admin/CreateUser")}`}>
            <NavLink className="nav-link" to="/admin/CreateUser">
              Create User
            </NavLink>
          </li>
          <li className={`nav-item ${isActive("/admin/AdminSaleView")}`}>
            <NavLink className="nav-link" to="/admin/AdminSaleView">
              Sale Details
            </NavLink>
          </li>
          <li className={`nav-item ${isActive("/admin/AdminInward")}`}>
            <NavLink className="nav-link" to="/admin/AdminInward">
              Item Master
            </NavLink>
          </li>
          <li className="nav-item">
            <div className="nav-link" onClick={handleLogout}>
              Logout
            </div>
          </li>
        </ul>
      </div>
      <div id="main-content">
        <Outlet />
        {/* This is where the nested routes will be rendered */}
      </div>
    </div>
  );
}

export default AdminDashboard;
