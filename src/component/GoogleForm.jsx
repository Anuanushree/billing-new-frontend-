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

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      // Use aoa_to_sheet to manually specify the rows
      [`Store: ${storeName}`, "", "", "", "", ""], // Store name row
      [`Date: ${dayjs().format("YYYY-MM-DD")}`, "", "", "", "", ""], // Date row
      [], // Empty row for spacing
      [
        "Date",
        "Sales",
        "Date",
        "Cash collection",
        "Swiping Card Amount",
        "Total",
      ], // Column headers
    ]);

    // Add table data to the worksheet
    XLSX.utils.sheet_add_json(
      worksheet,
      filteredData.map((row) => ({
        Date: row.SaleMessageDate
          ? format(parseISO(row.SaleMessageDate), "yyyy-MM-dd")
          : "-",
        Sales: row.Sale || "-",
        Date: format(parseISO(row.Date), "yyyy-MM-dd"),
        "Cash collection": row.Cash || "-",
        "Swiping Card Amount": row.POS || "-",
        Total: row.Total || "-",
      })),
      {
        header: [
          "Date",
          "Sales",
          "Date",
          "Cash collection",
          "Swiping Card Amount",
          "Total",
        ],
        skipHeader: true,
        origin: -1,
      }
    );

    // Set column widths
    const colWidths = [
      { wpx: 120 },
      { wpx: 80 },
      { wpx: 120 },
      { wpx: 150 },
      { wpx: 150 },
      { wpx: 80 },
    ];
    worksheet["!cols"] = colWidths;

    // Make the header bold
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: 3, c: C })];
      if (cell && cell.v) {
        cell.s = { font: { bold: true } };
      }
    }

    // Add totals to the worksheet
    const totalRow = [
      "Overall Total",
      overallTotals.sale,
      "",
      overallTotals.cash,
      overallTotals.pos,
      overallTotals.total,
    ];

    XLSX.utils.sheet_add_aoa(worksheet, [totalRow], { origin: -1 });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `Bank PV_${dayjs().format("YYYY-MM-DD")}.xlsx`);
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
