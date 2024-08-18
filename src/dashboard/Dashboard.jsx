import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import "./dashboard.css";

function Dashboard({ Base_url }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div id="app-container" className="clearfix">
      <div id="sidebar">
        <div className="sidebar-brand">
          <span>My Dashboard</span>
        </div>
        <ul className="sidebar-nav">
          <li className={`nav-item ${isActive("/exceldata")}`}>
            <Link className="nav-link" to="/exceldata">
              Billing
            </Link>
          </li>
          <li className={`nav-item ${isActive("/dailyReport")}`}>
            <Link className="nav-link" to="/dailyReport">
              Sales Report
            </Link>
          </li>
          <li className={`nav-item ${isActive("/Report")}`}>
            <Link className="nav-link" to="/Report">
              Sales Value
            </Link>
          </li>
          <li className={`nav-item ${isActive("/itemMaster")}`}>
            <Link className="nav-link" to="/itemMaster">
              Item Master
            </Link>
          </li>
          <li className={`nav-item ${isActive("/data")}`}>
            <Link className="nav-link" to="/data">
              Daily Statement
            </Link>
          </li>
          <li className={`nav-item ${isActive("/SaleReport")}`}>
            <Link className="nav-link" to="/SaleReport">
              Report
            </Link>
          </li>
          <li className={`nav-item ${isActive("/invoice")}`}>
            <Link className="nav-link" to="/invoice">
              Invoice Data
            </Link>
          </li>
          <li className={`nav-item ${isActive("/pv_report")}`}>
            <Link className="nav-link" to="/pv_report">
              PV Report
            </Link>
          </li>
          <li className={`nav-item ${isActive("/calc")}`}>
            <Link className="nav-link" to="/calc">
              Denomination
            </Link>
          </li>
          <li className={`nav-item ${isActive("/saleMessage")}`}>
            <Link className="nav-link" to="/saleMessage">
              Sale Message
            </Link>
          </li>
          <li className={`nav-item ${isActive("/googleForm")}`}>
            <Link className="nav-link" to="/googleForm">
              Google Form
            </Link>
          </li>
          <li className="nav-item">
            <div className="nav-link" onClick={handleLogout}>
              Logout
            </div>
          </li>
        </ul>
      </div>
      <div id="main-content">
        <Outlet /> {/* This is where the nested routes will be rendered */}
      </div>
    </div>
  );
}

export default Dashboard;
