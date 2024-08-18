import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./app.css";
import SignIn from "./component/login/signIn";
import Signup from "./component/login/Signup";
import ForgotPassword from "./component/passwordReset/ForgotPassword";
import ResetPassword from "./component/passwordReset/Reset";
import ExcelDetails from "./component/ExcelDetails";
import ExcelForm from "./component/ExcelForm";
import Data2 from "./component/Data2";
import DailySalesReport from "./component/SaleReport";
import ItemMaster from "./component/ItemMaster";
import AllData from "./component/AllData";
import MyComponent from "./component/sample";
import Report from "./component/Report";
import Invoice from "./component/Invoice";
import FinalReport from "./component/finalReport";
import Admin from "./Admindashboard/Admin";
import Adminsale from "./Admindashboard/Adminsale";
import Calc from "./component/Calc";
import AdminInward from "./Admindashboard/AdminInward";
import SalesMessage from "./component/SalesMessage";
import GoogleForm from "./component/GoogleForm";
import Body from "./Body";
import Home from "./Home";

const Base_url = "https://billing-backend-1.onrender.com";

function App() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("Admin");
  const [issubmit, SetIssubmit] = useState(false);
  const expiresIn = localStorage.getItem("expiresIn");

  const navigate = useNavigate();

  useEffect(() => {
    if (expiresIn && Date.now() > parseInt(expiresIn, 10)) {
      localStorage.clear();
      navigate("/");
    }
    if (!token) {
      localStorage.clear();
      navigate("/");
    }
  }, [token, expiresIn, navigate]);

  return (
    <div id="page-top">
      <Routes>
        <Route path="/" element={<Signup Base_url={Base_url} />} />
        {token ? (
          <>
            <Route path="/home" element={<Body Base_url={Base_url} />}>
              <Route
                path="exceldata"
                element={
                  <ExcelDetails Base_url={Base_url} SetIssubmit={SetIssubmit} />
                }
              />
              <Route path="invoice" element={<Invoice Base_url={Base_url} />} />
              <Route
                path="SaleReport"
                element={<Report Base_url={Base_url} issubmit={issubmit} />}
              />
              <Route
                path="excelForm2"
                element={<Data2 Base_url={Base_url} issubmit={issubmit} />}
              />
              <Route
                path="dailyReport"
                element={
                  <DailySalesReport Base_url={Base_url} issubmit={issubmit} />
                }
              />
              <Route path="calc" element={<Calc Base_url={Base_url} />} />
              <Route
                path="Report"
                element={<Data2 Base_url={Base_url} issubmit={issubmit} />}
              />
              <Route
                path="saleMessage"
                element={
                  <SalesMessage Base_url={Base_url} issubmit={issubmit} />
                }
              />
              <Route
                path="bankHistory"
                element={<GoogleForm Base_url={Base_url} />}
              />
              <Route
                path="itemMaster"
                element={<ItemMaster Base_url={Base_url} />}
              />
              <Route
                path="data"
                element={<AllData Base_url={Base_url} issubmit={issubmit} />}
              />
              <Route
                path="sample"
                element={
                  <MyComponent Base_url={Base_url} issubmit={issubmit} />
                }
              />
              <Route
                path="pv_report"
                element={
                  <FinalReport Base_url={Base_url} issubmit={issubmit} />
                }
              />
            </Route>
            {isAdmin && (
              <Route path="/admin" element={<Home Base_url={Base_url} />}>
                <Route
                  path="inward"
                  element={<ExcelForm Base_url={Base_url} />}
                />
                <Route
                  path="AdminInward"
                  element={<AdminInward Base_url={Base_url} />}
                />
                <Route
                  path="CreateUser"
                  element={<Admin Base_url={Base_url} />}
                />
                <Route
                  path="AdminSaleView"
                  element={<Adminsale Base_url={Base_url} />}
                />
              </Route>
            )}
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
      <ToastContainer />
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
