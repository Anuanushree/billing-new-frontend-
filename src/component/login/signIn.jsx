// src/component/login/SignIn.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Fade,
  Backdrop,
  Button,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export default function SignIn({ open, handleClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Both fields are required.");
      toast.error("Both fields are required.");
      return;
    }

    try {
      const user = { email, password };
      const response = await axios.post(
        `https://billing-backend-1.onrender.com/user/signin`,
        user
      );

      const { token, id, Admin, username } = response.data;

      if (token) {
        const currentTime = Date.now();
        const tokenValidityDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
        const expiresIn = currentTime + tokenValidityDuration;

        localStorage.setItem("token", token);
        localStorage.setItem("expiresIn", expiresIn.toString());
        localStorage.setItem("id", id);
        localStorage.setItem("Admin", Admin.toString());
        localStorage.setItem("userName", username);

        navigate(Admin ? "/admin/inward" : "/home/exceldata");
        handleClose();
        toast.success("Login successful!");
      } else {
        setError("Login failed. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleClose();
          }
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            pointerEvents: "none",
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Sign In
            </Typography>
            <Box>
              <Typography variant="body1">E-mail</Typography>
              <TextField
                InputProps={{ sx: { textAlign: "center" } }}
                placeholder="Enter registered E-mail id"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
            </Box>
            <Box>
              <Typography variant="body1">Password</Typography>
              <TextField
                InputProps={{ sx: { textAlign: "center" } }}
                placeholder="Enter password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                fullWidth
                required
              />
            </Box>
            <Box
              mt={2}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                sx={{
                  width: "100%",
                  maxWidth: 256,
                  height: "40px",
                  justifyContent: "center",
                }}
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Typography color="error" mt={2}>
                {error}
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Modal>
      <ToastContainer />
    </>
  );
}

SignIn.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
