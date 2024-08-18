import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  lastDayOfMonth,
  parseISO,
} from "date-fns";
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
} from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Dashboard from "../dashboard/Dashboard";

function GoogleForm({ Base_url }) {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [date, setDate] = useState(new Date());

  const token = localStorage.getItem("token");
  console.log(token);
  const headers = { headers: { authorization: `${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/bank`, headers);
        console.log("Raw Data:", response.data); // Debugging
        const rawData = response.data;

        // Transform data into the desired format
        const transformedData = transformData(rawData);
        console.log("Transformed Data:", transformedData); // Debugging

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
    const previousMonthEnd = subMonths(start, 1);

    // // Debugging: Check the calculated dates
    // console.log("Start Date:", start);
    // console.log("End Date:", end);
    // console.log("Previous Month End Date:", previousMonthEnd);

    const filteredByMonth = tableData.filter(
      (item) => new Date(item.Date) >= start && new Date(item.Date) <= end
    );

    console.log("Filtered Data for Month:", filteredByMonth); // Debugging

    // Ensure only the last entry of the previous month is included
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

  return (
    <div className="m-2">
      {/* <Dashboard /> */}
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
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sale Message Date</TableCell>
                <TableCell>Sale</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Cash</TableCell>
                <TableCell>POS</TableCell>
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
