import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
} from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import * as XLSX from "xlsx";
import Cookies from "cookies-js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function GoogleForm({ Base_url }) {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [overallTotals, setOverallTotals] = useState({
    cash: 0,
    pos: 0,
    total: 0,
    sale: 0,
  });

  const token = Cookies.get("token");
  const storeName = Cookies.get("storeName");
  const headers = { headers: { authorization: `${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/bank`, headers);
        const rawData = response.data;
        console.log("Raw Data:", rawData); // Check raw data
        const transformedData = transformData(rawData);
        console.log("Transformed Data:", transformedData); // Check transformed data
        setTableData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const year = selectedDate.year();
    const month = selectedDate.month();
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(new Date(year, month));

    const filteredByMonth = tableData.filter(
      (item) => new Date(item.Date) >= start && new Date(item.Date) <= end
    );

    // Calculate overall totals
    const totals = filteredByMonth.reduce(
      (acc, item) => {
        acc.sale += item.Sale || 0;
        acc.cash += item.Cash || 0;
        acc.pos += item.POS || 0;
        acc.total += item.Total || 0;
        return acc;
      },
      { cash: 0, pos: 0, total: 0, sale: 0 }
    );

    console.log("Filtered Data:", filteredByMonth); // Check filtered data
    console.log("Overall Totals:", totals); // Check totals
    setFilteredData(filteredByMonth);
    setOverallTotals(totals);
  }, [tableData, selectedDate]);

  const transformData = (data) => {
    return data.map((item, index) => ({
      SaleMessageDate: index > 0 ? data[index - 1].Date : null,
      Sale: index > 0 ? data[index - 1].Sale : null,
      Date: item.Date,
      Cash: item.Cash,
      POS: item.Pos,
      Total: (item.Cash || 0) + (item.Pos || 0),
    }));
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Define font style
    const fontStyle = {
      name: "Times New Roman",
      size: 10,
      bold: false,
      italic: false,
      underline: false,
    };

    // Define border style
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Define cell alignment
    const alignment = { vertical: "middle", horizontal: "center" };

    // Helper function to apply font, border, and alignment to cells
    const applyStyles = (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = fontStyle;
        cell.border = borderStyle;
        cell.alignment = alignment;
      });
    };

    // Add and merge header rows
    const headerRow1 = worksheet.addRow([
      "TAMIL NADU STATE MARKETING CORPORATION LIMITED",
    ]);
    worksheet.mergeCells(headerRow1.number, 1, headerRow1.number, 6); // Adjust column range as needed
    headerRow1.alignment = { horizontal: "center", vertical: "middle" };
    headerRow1.font = { bold: true };
    applyStyles(headerRow1); // Apply styles to header row

    const headerRow2 = worksheet.addRow([
      "B-4, Ambattur Industrial Estate, Chennai (South) District, Chennai - 58.",
    ]);
    worksheet.mergeCells(headerRow2.number, 1, headerRow2.number, 6); // Adjust column range as needed
    headerRow2.alignment = { horizontal: "center", vertical: "middle" };
    headerRow2.font = { bold: true };
    applyStyles(headerRow2); // Apply styles to header row

    const headerRow3 = worksheet.addRow([
      `CLOSING STOCK DETAILS AS ON ${dayjs().format(
        "DD MMMM YYYY"
      )} SHOP NO ${storeName}`,
    ]);
    worksheet.mergeCells(headerRow3.number, 1, headerRow3.number, 6); // Adjust column range as needed
    headerRow3.alignment = { horizontal: "center", vertical: "middle" };
    headerRow3.font = { bold: true };
    applyStyles(headerRow3); // Apply styles to header row

    // Add empty row for spacing
    worksheet.addRow([]);

    // Add headers
    const headers = [
      "Date",
      "Sales",
      "Date",
      "Cash collection",
      "Swiping Card Amount",
      "Total",
    ];
    const headerRow = worksheet.addRow(headers);

    // Style headers
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { ...fontStyle, bold: true };
      cell.border = borderStyle;
      cell.alignment = alignment;
    });

    // Add table data and center-align
    filteredData.forEach((row) => {
      const dataRow = worksheet.addRow([
        row.SaleMessageDate
          ? format(parseISO(row.SaleMessageDate), "yyyy-MM-dd")
          : "-",
        row.Sale || "-",
        format(parseISO(row.Date), "yyyy-MM-dd"),
        row.Cash || "-",
        row.POS || "-",
        row.Total || "-",
      ]);

      // Apply font style and border to data rows
      applyStyles(dataRow);
    });

    // Add overall totals row
    const totalRow = worksheet.addRow([
      "Overall Total",
      overallTotals.sale,
      "",
      overallTotals.cash,
      overallTotals.pos,
      overallTotals.total,
    ]);

    // Style totals row
    totalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { ...fontStyle, bold: true };
      cell.border = borderStyle;
      cell.alignment = alignment;
    });

    // Set column widths to ensure content fits well and adds visual spacing
    worksheet.columns = [
      { width: 20 }, // Date (Previous Date)
      { width: 18 }, // Sales (Previous Sale)
      { width: 20 }, // Date (Current Date)
      { width: 22 }, // Cash collection
      { width: 25 }, // Swiping Card Amount
      { width: 18 }, // Total
    ];

    // Adjust row heights for better spacing
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.height = 20; // Adjust height as needed
    });

    // Generate the Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Bank PV_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  return (
    <div className="m-2">
      <Container>
        <Box
          marginBottom={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={["month", "year"]}
                value={selectedDate}
                onChange={handleDateChange}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />,
                }}
              />
            </LocalizationProvider>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <p>Store: {storeName}</p>
            <Button variant="contained" color="primary" onClick={exportToExcel}>
              Export to Excel
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Sales</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Cash collection</TableCell>
                <TableCell>Swiping Card Amount</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {row.SaleMessageDate
                          ? format(parseISO(row.SaleMessageDate), "yyyy-MM-dd")
                          : "-"}
                      </TableCell>
                      <TableCell>{row.Sale || "-"}</TableCell>
                      <TableCell>
                        {format(parseISO(row.Date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{row.Cash || "-"}</TableCell>
                      <TableCell>{row.POS || "-"}</TableCell>
                      <TableCell>{row.Total || "-"}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      colSpan={1}
                      align="right"
                      style={{ fontWeight: "bold" }}
                    >
                      Overall Total
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {overallTotals.sale}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}></TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {overallTotals.cash}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {overallTotals.pos}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {overallTotals.total}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
}

export default GoogleForm;
