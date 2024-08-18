import React, { useState } from "react";
import SignIn from "./signIn";
import Dashboard from "../../dashboard/Dashboard";
import { Outlet } from "react-router-dom";

function Signup() {
  const [isSignInOpen, setSignInOpen] = useState(true);

  const handleSignInOpen = () => {
    setSignInOpen(true);
  };

  // const handleSignInClose = () => {
  //   setSignInOpen(false);
  // };
  const token = localStorage.getItem("token");
  const handleSignInClose = () => {
    if (token) {
      setSignInOpen(false);
    }
  };

  return (
    <div>
      {isSignInOpen && (
        <SignIn open={isSignInOpen} handleClose={handleSignInClose} />
      )}
      <Dashboard />
      {/* <div id="wrapper">
        <Outlet />
      </div> */}
    </div>
  );
}

export default Signup;
