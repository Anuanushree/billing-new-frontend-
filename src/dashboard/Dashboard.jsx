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
          <li className={`nav-item ${isActive("/home/exceldata")}`}>
            <Link className="nav-link" to="/home/exceldata">
              Billing
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/dailyReport")}`}>
            <Link className="nav-link" to="/home/dailyReport">
              Sales Report
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/Report")}`}>
            <Link className="nav-link" to="/home/Report">
              Sales Value
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/itemMaster")}`}>
            <Link className="nav-link" to="/home/itemMaster">
              Item Master
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/data")}`}>
            <Link className="nav-link" to="/home/data">
              Daily Statement
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/SaleReport")}`}>
            <Link className="nav-link" to="/home/SaleReport">
              Report
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/invoice")}`}>
            <Link className="nav-link" to="/home/invoice">
              Invoice Data
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/pv_report")}`}>
            <Link className="nav-link" to="/home/pv_report">
              PV Report
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/calc")}`}>
            <Link className="nav-link" to="/home/calc">
              Denomination
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/saleMessage")}`}>
            <Link className="nav-link" to="/home/saleMessage">
              Sale Message
            </Link>
          </li>
          <li className={`nav-item ${isActive("/home/bankHistory")}`}>
            <Link className="nav-link" to="/home/bankHistory">
              Bank history
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
        <Outlet />
        {/* This is where the nested routes will be rendered */}
      </div>
    </div>
  );
}

export default Dashboard;
