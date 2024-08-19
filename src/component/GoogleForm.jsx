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

function GoogleForm({ Base_url }) {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const token = localStorage.getItem("token");
  const headers = { headers: { authorization: `${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/bank`, headers);
        const rawData = response.data;
        const transformedData = transformData(rawData);
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

    setFilteredData(filteredByMonth);
  }, [tableData, selectedDate]);

  const transformData = (data) => {
    return data.map((item, index) => ({
      SaleMessageDate: index > 0 ? data[index - 1].Date : null,
      Sale: index > 0 ? data[index - 1].Sale : null,
      Date: item.Date,
      Cash: item.Cash,
      POS: item.Pos,
      Total: item.Cash + item.Pos,
    }));
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        Date: row.SaleMessageDate
          ? format(parseISO(row.SaleMessageDate), "yyyy-MM-dd")
          : "-",
        Sales: row.Sale || "-",
        Date: format(parseISO(row.Date), "yyyy-MM-dd"),
        "Cash collection": row.Cash || "-",
        "Swiping Card Amount": row.POS || "-",
        Total: row.Total || "-",
      }))
    );

    const workbook = XLSX.utils.book_new();

    // Setting column widths
    const colWidths = [
      { wpx: 120 },
      { wpx: 80 },
      { wpx: 120 },
      { wpx: 150 },
      { wpx: 150 },
      { wpx: 80 },
    ];
    worksheet["!cols"] = colWidths;

    // Making the header bold
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell && cell.v) {
        cell.s = { font: { bold: true } };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `Bank PV_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  return (
    <div className="m-2">
      <Container>
        <Box marginBottom={2} display="flex" gap={2}>
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
          <Button variant="contained" color="primary" onClick={exportToExcel}>
            Export to Excel
          </Button>
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
                filteredData.map((row, index) => (
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
                ))
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
