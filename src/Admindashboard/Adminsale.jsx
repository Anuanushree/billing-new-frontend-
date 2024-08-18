import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CircularProgress,
  Snackbar,
  SnackbarContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import AdminDashboard from "./AdminDashboard";

function Adminsale({ Base_url }) {
  const [users, setUsers] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDetails, setFormDetails] = useState([]);
  const [filteredData, setFilteredData] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  const headers = {
    headers: { authorization: `${token}` },
  };

  useEffect(() => {
    getUser();
    fetchFormDetails();
  }, []);

  useEffect(() => {
    if (users.length > 0 && formDetails.length > 0) {
      filterAndSeparateData(formDetails);
    }
  }, [users, formDetails]);

  const getUser = async () => {
    try {
      const response = await axios.get(`${Base_url}/user/list`);
      setUsers(response.data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const fetchFormDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${Base_url}/user/getAllData`);
      setFormDetails(response.data);
    } catch (error) {
      console.error("Error fetching sale records:", error);
      showSnackbar("Error fetching sale records", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSeparateData = (data) => {
    const filteredData = {};

    users.forEach((user) => {
      const userId = user.id;
      const totalQuantity = data
        .filter(
          (item) => item.user === userId && !isNaN(parseInt(item.Closing_value))
        )
        .reduce((acc, item) => acc + parseInt(item.Sale_value || 0, 10), 0);

      filteredData[userId] = {
        userName: user.username,
        totalQuantity: totalQuantity || 0, // Default to 0 if NaN
      };
    });

    setFilteredData(filteredData);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Base_url}/user/getAllDailyData?date=${date}`,
        headers
      );
      setFormDetails(response.data);
    } catch (error) {
      console.error("Error fetching daily sale records:", error);
      showSnackbar("Error fetching daily sale records", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="wrapper">
      <AdminDashboard />

      <div style={{ margin: "20px" }}>
        <h1>Sales Data</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ height: "36px", padding: "0 10px" }}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>

        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell align="right">Total Sale</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(filteredData).map((userId) => (
                <TableRow key={userId}>
                  <TableCell component="th" scope="row">
                    {filteredData[userId]?.userName}
                  </TableCell>
                  <TableCell align="right">
                    {filteredData[userId]?.totalQuantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Snackbar for user feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <SnackbarContent
          style={{
            backgroundColor: snackbarMessage.includes("success")
              ? "green"
              : "red",
          }}
          message={snackbarMessage}
          action={
            <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
              CLOSE
            </Button>
          }
        />
      </Snackbar>

      {/* Loading indicator */}
      {loading && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
}

export default Adminsale;
