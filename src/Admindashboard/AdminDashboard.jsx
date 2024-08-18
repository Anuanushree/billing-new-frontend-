import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const [profile, setProfile] = useState({ username: "Admin" }); // Example profile state
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    navigate("/");
  };

  return (
    <div>
      <div id="wrapper">
        <ul
          className="navbar-nav bg-gradient bg sidebar sidebar-dark accordion"
          id="accordionSidebar"
        >
          <a className="sidebar-brand d-flex align-items-center justify-content-center">
            <div className="sidebar-brand-icon rotate-n-15">
              <br />
              <br />
              <a>
                <i className="fa fa-user icon" aria-hidden="true"></i>
              </a>
              <p className="dashboard-user"></p>
            </div>
            <div className="sidebar-brand-text mx-3"></div>
          </a>
          <br />
          <br />
          <li className="nav-item">
            <NavLink className="nav-link" activeClassName="active" to="/inward">
              
              <span>Inward</span>
            </NavLink>
          </li>

          <hr className="sidebar-divider"></hr>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              activeClassName="active"
              to="/CreateUser"
            >
           
              <span>Create user</span>
            </NavLink>
          </li>
          <hr className="sidebar-divider"></hr>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              activeClassName="active"
              to="/AdminSaleView"
            >
              
              <span>Sale details</span>
            </NavLink>
          </li>
          <hr className="sidebar-divider"></hr>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              activeClassName="active"
              to="/AdminInward"
            >
              
              <span>Item Master</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <div className="nav-link" onClick={handleLogout}>
            
              <span>Logout</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
