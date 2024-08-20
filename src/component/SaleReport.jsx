import React, { useEffect, useState, useMemo } from "react";
import Dashboard from "../dashboard/Dashboard";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
} from "@mui/material";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Cookies from "cookies-js";
import ExcelJS from "exceljs";

function DailySalesReport({ Base_url }) {
  const [Pos, setPos] = useState(0);
  const [Cash, setCash] = useState(0);
  const [Bank, setBank] = useState(0);
  const [paytm, setPaytm] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [data, setData] = useState([]);
  const [formDetails, setFormDetails] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [val, setVal] = useState(0);

  const token = Cookies.get("token");
  const storeName = Cookies.get("storeName");
  const headers = {
    headers: { authorization: `${token}` },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/getData`, headers);
        console.log(response.data);
        console.log(date);
        const submit = response.data.filter(
          (d) => d.isSubmit == true && d.Date.substring(0, 10) === date
        );
        console.log(submit, "submit");
        if (submit.length > 4) {
          const response = await axios.get(
            `${Base_url}/user/getdailyData`,
            headers
          );
          const filt = response.data.filter(
            (d) => d.Date.substring(0, 10) === date
          );
          setFormDetails(filt);

          const totalClosingValue = filt.reduce(
            (total, item) => total + (item.Sale_value || 0),
            0
          );
          setVal(totalClosingValue);
        } else {
          const today = new Date().toISOString().split("T")[0];
          const dateBySort = response.data.filter(
            (d) => new Date(d.Date).toISOString().split("T")[0] === today
          );
          console.log(dateBySort);

          setFormDetails(response.data);

          // Calculate total closing value
          const totalClosingValue = response.data.reduce(
            (total, item) => total + (item.Sale_value || 0),
            0
          );
          setVal(totalClosingValue);
        }
        // Ensure proper date comparison
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/"); // Replace '/login' with the path to your login page
        } else {
          // Handle other errors
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/bank`, headers);
        console.log(response.data);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // Month is zero-based
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const filteredData = response.data.filter((d) => {
          const date = new Date(d.Date);
          return date >= firstDayOfMonth && date <= lastDayOfMonth;
        });
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching bank data:", error);
      }
    };
    fetchBankData();
  }, []);

  const totalPos = useMemo(
    () => data.reduce((total, item) => total + (item.Pos || 0), 0),
    [data]
  );
  const totalCash = useMemo(
    () => data.reduce((total, item) => total + (item.Cash || 0), 0),
    [data]
  );
  const totalSale = useMemo(
    () => data.reduce((total, item) => total + (item.Sale || 0), 0),
    [data]
  );
  const totalBank = useMemo(
    () => data.reduce((total, item) => total + (item.Bank || 0), 0),
    [data]
  );
  const totalPaytm = useMemo(
    () =>
      data.reduce((total, item) => total + (parseFloat(item.Paytm) || 0), 0),
    [data]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { Pos, Cash, Bank, Sale: val, Paytm: paytm };

    try {
      const response = await axios.post(
        `${Base_url}/user/dailyReport`,
        data,
        headers
      );
      console.log(response.data);
      toast.success("Successfully added");
    } catch (error) {
      console.error("Error in daily report:", error);
      toast.warning(error.message);
    }
  };

  const handleSearchDate = async () => {
    if (fromDate && toDate) {
      try {
        const response = await axios.post(`${Base_url}/user/getReportSearch`, {
          dateSearch: { fromDate, toDate },
        });
        console.log(response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error searching dates:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const exportToExcel = () => {
    // Define border style
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Define font styles
    const boldFontStyle = { bold: true };
    const normalFontStyle = { bold: false };

    // Define alignment style
    const alignment = { horizontal: "center", vertical: "middle" };

    // Function to apply styles to a cell
    const styleCell = (cell, isBold) => {
      cell.font = isBold ? boldFontStyle : normalFontStyle;
      cell.border = borderStyle;
      cell.alignment = alignment;
    };

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoice Data");

    // Set column widths
    worksheet.columns = [
      { width: 12 }, // S.no
      { width: 15 }, // Invoice Date
      { width: 22 }, // STOCK TRANSFER IN CASES
      { width: 22 }, // IMFL Cases
      { width: 22 }, // BEER Cases
      { width: 22 }, // Total Cases
      { width: 16 }, // 1000
      { width: 16 }, // 750
      { width: 16 }, // 375
      { width: 16 }, // 180
      { width: 22 }, // Total
      { width: 22 }, // Amount
      { width: 16 }, // 650
      { width: 16 }, // 500
      { width: 16 }, // 325
      { width: 22 }, // Total
      { width: 22 }, // Amount
      { width: 22 }, // Total Bottles
      { width: 22 }, // Total Amount
    ];

    // Add and merge header rows
    const headerRow1 = worksheet.addRow([
      "TAMIL NADU STATE MARKETING CORPORATION LIMITED",
    ]);
    worksheet.mergeCells(headerRow1.number, 1, headerRow1.number, 18);
    styleCell(headerRow1.getCell(1), true); // Apply bold font to merged cell

    const headerRow2 = worksheet.addRow([
      "B-4, Ambattur Industrial Estate, Chennai (South) District, Chennai - 58.",
    ]);
    worksheet.mergeCells(headerRow2.number, 1, headerRow2.number, 18);
    styleCell(headerRow2.getCell(1), true); // Apply bold font to merged cell

    const headerRow3 = worksheet.addRow([
      `CLOSING STOCK DETAILS AS ON ${new Date().toLocaleDateString()} SHOP NO ${storeName}`,
    ]);
    worksheet.mergeCells(headerRow3.number, 1, headerRow3.number, 18);
    styleCell(headerRow3.getCell(1), true); // Apply bold font to merged cell

    // Add table headers
    const tableHeaderRow1 = worksheet.addRow([
      "S.no",
      "Invoice Date",
      "STOCK TRANSFER IN CASES",
      "",
      "",
      "",
      "STOCK TRANSFER IN BOTTLES (IMFL)",
      "",
      "",
      "",
      "",
      "",
      "STOCK TRANSFER IN BOTTLES (BEER)",
      "",
      "",
      "",
      "",
      "Total Bottles",
      "Total Amount",
    ]);
    tableHeaderRow1.eachCell({ includeEmpty: true }, (cell) => {
      styleCell(cell, true); // Apply bold font to header row
    });

    const tableHeaderRow2 = worksheet.addRow([
      "",
      "",
      "Invoice No",
      "IMFL Cases",
      "BEER Cases",
      "Total Cases",
      "1000",
      "750",
      "375",
      "180",
      "Total",
      "Amount",
      "650",
      "500",
      "325",
      "Total",
      "Amount",
    ]);
    tableHeaderRow2.eachCell({ includeEmpty: true }, (cell) => {
      styleCell(cell, true); // Apply bold font to header row
    });

    // Define data and grand totals calculation
    const data = formDetails.map((item, i) => [
      i + 1,
      formatDate(item.Date),
      item.Invoice,
      item.IMFS_case,
      item.Beer_Case,
      item.Total_Case,
      item.IMFS_sie?.["1000"] || 0,
      item.IMFS_sie?.["750"] || 0,
      item.IMFS_sie?.["375"] || 0,
      item.IMFS_sie?.["180"] || 0,
      item.IMFS_total_bottle,
      item.IMFS_total_value,
      item.Beer_size?.["650"] || 0,
      item.Beer_size?.["500"] || 0,
      item.Beer_size?.["325"] || 0,
      item.Beer_total_bottle,
      item.Beer_total_value,
      item.Total_Bottle,
      item.Total_amount,
    ]);

    const grandTotals = calculateGrandTotals();
    data.push([
      "Grand Total",
      "",
      "",
      grandTotals.IMFS_case,
      grandTotals.Beer_Case,
      grandTotals.Total_Case,
      grandTotals.IMFS_sie_1000,
      grandTotals.IMFS_sie_750,
      grandTotals.IMFS_sie_375,
      grandTotals.IMFS_sie_180,
      grandTotals.IMFS_total_bottle,
      grandTotals.IMFS_total_value,
      grandTotals.Beer_size_650,
      grandTotals.Beer_size_500,
      grandTotals.Beer_size_325,
      grandTotals.Beer_total_bottle,
      grandTotals.Beer_total_value,
      grandTotals.Total_Bottle,
      grandTotals.Total_amount,
    ]);

    // Add data rows
    data.forEach((row) => {
      const dataRow = worksheet.addRow(row);
      // Apply normal font style to data rows
      dataRow.eachCell({ includeEmpty: true }, (cell) => {
        styleCell(cell, false);
      });
    });

    // Apply bold font style to the last row (Grand Total)
    const totalRow = worksheet.addRow([
      "Grand Total",
      "",
      "",
      grandTotals.IMFS_case,
      grandTotals.Beer_Case,
      grandTotals.Total_Case,
      grandTotals.IMFS_sie_1000,
      grandTotals.IMFS_sie_750,
      grandTotals.IMFS_sie_375,
      grandTotals.IMFS_sie_180,
      grandTotals.IMFS_total_bottle,
      grandTotals.IMFS_total_value,
      grandTotals.Beer_size_650,
      grandTotals.Beer_size_500,
      grandTotals.Beer_size_325,
      grandTotals.Beer_total_bottle,
      grandTotals.Beer_total_value,
      grandTotals.Total_Bottle,
      grandTotals.Total_amount,
    ]);
    totalRow.eachCell({ includeEmpty: true }, (cell) => {
      styleCell(cell, true); // Apply bold font to total row
    });

    // Increase row height for all rows
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.height = 30; // Increase row height (adjust as needed)
    });

    // Define cell merges
    worksheet.mergeCells(4, 3, 4, 6); // Merge "STOCK TRANSFER IN CASES"
    worksheet.mergeCells(4, 7, 4, 12); // Merge "STOCK TRANSFER IN BOTTLES (IMFL)"
    worksheet.mergeCells(4, 13, 4, 17); // Merge "STOCK TRANSFER IN BOTTLES (BEER)"

    // Create workbook and write file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "invoice_data.xlsx");
    });
  };

  return (
    <div className="border bordered">
      <Container>
        <ToastContainer />
        <Box mb={3}>
          <Typography variant="h4" gutterBottom>
            Daily Sales Report
          </Typography>
        </Box>

        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="From Date"
                value={fromDate || ""}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="To Date"
                value={toDate || ""}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchDate}
              sx={{ mr: 2 }}
            >
              Search
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={exportToExcel}
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <Typography variant="h6">Sale: {val}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="POS"
                type="number"
                value={Pos}
                onChange={(e) => setPos(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Cash"
                type="number"
                value={Cash}
                onChange={(e) => setCash(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Bank"
                type="number"
                value={Bank}
                onChange={(e) => setBank(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Paytm"
                type="number"
                value={paytm}
                onChange={(e) => setPaytm(e.target.value)}
                fullWidth
                required
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </form>

        <Box mt={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Sale Details</TableCell>
                  <TableCell>Cash Collection Amount</TableCell>
                  <TableCell>Swiping Card Amount</TableCell>
                  <TableCell>Paytm Amount</TableCell>
                  <TableCell>Bank Deposit Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {new Date(d.Date).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell>{d.Sale}</TableCell>
                    <TableCell>{d.Cash}</TableCell>
                    <TableCell>{d.Pos}</TableCell>
                    <TableCell>{d.Paytm}</TableCell>
                    <TableCell>{d.Bank}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={1}>Total</TableCell>
                  <TableCell>{totalSale}</TableCell>
                  <TableCell>{totalCash}</TableCell>
                  <TableCell>{totalPos}</TableCell>
                  <TableCell>{totalPaytm}</TableCell>
                  <TableCell>{totalBank}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </div>
  );
}

export default DailySalesReport;
