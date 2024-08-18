import React, { useEffect, useState, useMemo } from "react";
import Dashboard from "../dashboard/Dashboard";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

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
  const token = localStorage.getItem("token");

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
    const sanitizedData = data.map(({ _id, __v, Date, ...rest }) => ({
      Date: formatDate(Date),
      "Sale Details": rest.Sale,
      "Cash Collection Amount": rest.Cash,
      "Swiping Card Amount": rest.Pos,
      "Paytm Amount": parseFloat(rest.Paytm || 0),
      "Bank Deposit amount": rest.Bank,
    }));

    const total = sanitizedData.reduce(
      (acc, item) => {
        acc["Sale Details"] += item["Sale Details"];
        acc["Cash Collection Amount"] += item["Cash Collection Amount"];
        acc["Swiping Card Amount"] += item["Swiping Card Amount"];
        acc["Paytm Amount"] += item["Paytm Amount"];
        acc["Bank Deposit amount"] += item["Bank Deposit amount"];
        return acc;
      },
      {
        Date: "Total",
        "Sale Details": 0,
        "Cash Collection Amount": 0,
        "Swiping Card Amount": 0,
        "Paytm Amount": 0,
        "Bank Deposit amount": 0,
      }
    );

    const dataWithTotal = sanitizedData.concat(total);

    const ws = XLSX.utils.json_to_sheet(dataWithTotal);
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Sale Details
      { wch: 22 }, // Cash Collection Amount
      { wch: 22 }, // Swiping Card Amount
      { wch: 16 }, // Paytm Amount
      { wch: 22 }, // Bank Deposit amount
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Sale_Report from ${fromDate} to ${toDate}.xlsx`);
  };

  return (
    <div>
      {/* <Dashboard /> */}
      <ToastContainer />
      <div className="container-fluid form-container">
        <div className="form-group">
          <label>From Date:</label>
          <input
            type="date"
            value={fromDate || ""}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>To Date:</label>
          <input
            type="date"
            value={toDate || ""}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control"
          />
        </div>
        <button onClick={handleSearchDate}>Search</button>
        <button onClick={exportToExcel}>Export to Excel</button>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sale: </label>&nbsp;&nbsp;
            <label>{val}</label>
          </div>
          <div className="form-group">
            <label>Pos</label>
            <input
              type="number"
              value={Pos}
              onChange={(e) => setPos(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Cash</label>
            <input
              type="number"
              value={Cash}
              onChange={(e) => setCash(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Bank</label>
            <input
              type="number"
              value={Bank}
              onChange={(e) => setBank(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Paytm</label>
            <input
              type="number"
              value={paytm}
              onChange={(e) => setPaytm(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-default form-control bg-primary mt-4"
          >
            Submit
          </button>
        </form>

        <table className="table table-dark table-bordered border border-primary p-2 m-4">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sale Details</th>
              <th>Cash Collection Amount</th>
              <th>Swiping Card Amount</th>
              <th>Paytm Amount</th>
              <th>Bank Deposit amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{new Date(d.Date).toLocaleDateString("en-GB")}</td>
                <td>{d.Sale}</td>
                <td>{d.Cash}</td>
                <td>{d.Pos}</td>
                <td>{d.Paytm}</td>
                <td>{d.Bank}</td>
              </tr>
            ))}
            <tr></tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={1}>Total</td>
              <td>{totalSale}</td>
              <td>{totalCash}</td>
              <td>{totalPos}</td>
              <td>{totalPaytm}</td>
              <td>{totalBank}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default DailySalesReport;
