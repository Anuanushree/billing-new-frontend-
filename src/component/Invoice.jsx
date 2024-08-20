import React, { useEffect, useState } from "react";
import Dashboard from "../dashboard/Dashboard";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Cookies from "cookies-js";
import ExcelJS from "exceljs";

function Invoice({ Base_url }) {
  const [formDetails, setFormDetails] = useState([]);
  const [backData, setBackData] = useState([]);
  const [data, setdata] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const id = Cookies.get("id");
  const token = Cookies.get("token");
  const storeName = Cookies.get("storeName");
  const headers = {
    headers: { authorization: `${token}` },
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${Base_url}/user/getinvoice`,
          headers
        );
        setFormDetails(response.data);
        console.log(response.data);
        setBackData(response.data);
        // Assuming response.data is an array of objects
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/"); // Replace '/login' with the path to your login page
        } else {
          // Handle other errors

          toast.error("Failed to fetch data from server");
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [Base_url]);
  useEffect(() => {
    get();
  }, []);

  var get = async () => {
    try {
      const response = await axios.get(`${Base_url}/user/getData`, headers);
      console.log(response.data);
      // const fil = response.data.filter((f) => f.Total_bottle > 0);
      setdata(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/"); // Replace '/login' with the path to your login page
      } else {
        // Handle other errors
        console.error("Error fetching data:", error);
      }
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSeacrhDate = async () => {
    if (fromDate && toDate) {
      const dateSearch = {
        fromDate,
        toDate,
      };

      console.log("Date search:", dateSearch);

      try {
        const response = await axios.post(
          `${Base_url}/user/getinvoiceSearch`,
          { dateSearch },
          headers
        );

        console.log("Response data:", response.data);
        console.log(response.data);
        if (response.data) {
          setFormDetails(response.data);
        } else {
          console.error("No data received from the API.");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/"); // Replace '/login' with the path to your login page
        } else {
          // Handle other errors
          console.error("Error fetching data:", error);
        }
      }
    } else {
      console.warn("Both fromDate and toDate must be specified.");
    }
  };
  const exportToExcel = () => {
    // Define border style
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Define font and alignment styles
    const fontStyle = { bold: true };
    const alignment = { horizontal: "center", vertical: "middle" };

    // Function to apply styles to a cell
    const styleCell = (cell) => {
      cell.font = fontStyle;
      cell.border = borderStyle;
      cell.alignment = alignment;
    };

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoice Data");

    // Add and merge header rows
    const headerRow1 = worksheet.addRow([
      "TAMIL NADU STATE MARKETING CORPORATION LIMITED",
    ]);
    worksheet.mergeCells(headerRow1.number, 1, headerRow1.number, 19);
    headerRow1.font = fontStyle;
    headerRow1.alignment = alignment;
    worksheet.getRow(headerRow1.number).height = 30; // Increase row height

    const headerRow2 = worksheet.addRow([
      "B-4, Ambattur Industrial Estate, Chennai (South) District, Chennai - 58.",
    ]);
    worksheet.mergeCells(headerRow2.number, 1, headerRow2.number, 19);
    headerRow2.font = fontStyle;
    headerRow2.alignment = alignment;
    worksheet.getRow(headerRow2.number).height = 30; // Increase row height

    const headerRow3 = worksheet.addRow([
      `CLOSING STOCK DETAILS AS ON ${new Date().toLocaleDateString()} SHOP NO ${storeName}`,
    ]);
    worksheet.mergeCells(headerRow3.number, 1, headerRow3.number, 19);
    headerRow3.font = fontStyle;
    headerRow3.alignment = alignment;
    worksheet.getRow(headerRow3.number).height = 30; // Increase row height

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

    // Add headers for the table
    worksheet.addRow([
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

    worksheet.addRow([
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

    // Add data rows
    data.forEach((row) => worksheet.addRow(row));

    // Apply styles and borders to all cells
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        styleCell(cell);
      });
    });

    // Increase row height for the table rows
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.height = 25; // Increase row height
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

  // Function to apply styles to a row

  const calculateGrandTotals = () => {
    // Initialize totals object
    const totals = {
      Invoice: "Grand Total",
      IMFS_case: 0,
      Beer_Case: 0,
      Total_Case: 0,
      IMFS_sie_1000: 0,
      IMFS_sie_750: 0,
      IMFS_sie_375: 0,
      IMFS_sie_180: 0,
      IMFS_total_bottle: 0,
      IMFS_total_value: 0,
      Beer_size_650: 0,
      Beer_size_500: 0,
      Beer_size_325: 0,
      Beer_total_bottle: 0,
      Beer_total_value: 0,
      Total_Bottle: 0,
      Total_amount: 0,
    };
    // Loop through formDetails to compute sums
    formDetails.forEach((item) => {
      totals.IMFS_case += item.IMFS_case || 0;
      totals.Beer_Case += item.Beer_Case || 0;
      totals.Total_Case += item.Total_Case || 0;
      totals.IMFS_sie_1000 +=
        item.IMFS_sie && item.IMFS_sie["1000"] ? item.IMFS_sie["1000"] : 0;
      totals.IMFS_sie_750 +=
        item.IMFS_sie && item.IMFS_sie["750"] ? item.IMFS_sie["750"] : 0;
      totals.IMFS_sie_375 +=
        item.IMFS_sie && item.IMFS_sie["375"] ? item.IMFS_sie["375"] : 0;
      totals.IMFS_sie_180 +=
        item.IMFS_sie && item.IMFS_sie["180"] ? item.IMFS_sie["180"] : 0;
      totals.IMFS_total_bottle += item.IMFS_total_bottle || 0;
      totals.IMFS_total_value += item.IMFS_total_value || 0;
      totals.Beer_size_650 +=
        item.Beer_size && item.Beer_size["650"] ? item.Beer_size["650"] : 0;
      totals.Beer_size_500 +=
        item.Beer_size && item.Beer_size["500"] ? item.Beer_size["500"] : 0;
      totals.Beer_size_325 +=
        item.Beer_size && item.Beer_size["325"] ? item.Beer_size["325"] : 0;
      totals.Beer_total_bottle += item.Beer_total_bottle || 0;
      totals.Beer_total_value += item.Beer_total_value || 0;
      totals.Total_Bottle += item.Total_Bottle || 0;
      totals.Total_amount += item.Total_amount || 0;
    });

    return totals;
  };

  // Get grand totals object
  const grandTotals = calculateGrandTotals();

  console.log(data);
  return (
    <div className="m-2">
      {/* <Dashboard /> */}
      <ToastContainer />

      <div>
        <table>
          <tr>
            <td>
              <div className="form-group">
                <label>From Date:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="form-control"
                />
              </div>
            </td>
            <td>
              <div className="form-group">
                <span>
                  <label>To Date:</label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="form-control"
                  />
                </span>
              </div>
            </td>
            <td>
              {" "}
              <button onClick={handleSeacrhDate}>Search</button>
            </td>
            <td>
              {" "}
              <button onClick={exportToExcel}>Export to Excel</button>
            </td>
          </tr>
        </table>

        <div className="table-container">
          <table className="table table-dark table-bordered border border-primary p-2 m-4">
            <thead>
              <tr>
                <th rowSpan={2}>S.no</th>
                <th rowSpan={2}>Invoice Date</th>
                <th colSpan={4}>STOCK TRANSFER IN CASES</th>
                <th colSpan={6}>STOCK TRANSFER IN BOTTLES (IMFL)</th>
                <th colSpan={5}>STOCK TRANSFER IN BOTTLES (BEER)</th>
                <th rowSpan={2}>Total Bottles</th>
                <th rowSpan={2}>Total Amount</th>
              </tr>
              <tr>
                <th>Invoice No</th>
                <th>IMFL Cases</th>
                <th>BEER Cases</th>
                <th>Total Cases</th>
                <th>1000</th>
                <th>750</th>
                <th>375</th>
                <th>180</th>
                <th>Total</th>
                <th>Amount</th>
                <th>650</th>
                <th>500</th>
                <th>325</th>
                <th>Total</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {formDetails &&
                formDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDate(item.Date)}</td>
                    <td>{item.Invoice}</td>
                    <td>{item.IMFS_case}</td>
                    <td>{item.Beer_Case}</td>
                    <td>{item.Total_Case}</td>
                    <td>
                      {item.IMFS_sie && item.IMFS_sie["1000"]
                        ? item.IMFS_sie["1000"]
                        : 0}
                    </td>
                    <td>
                      {item.IMFS_sie && item.IMFS_sie["750"]
                        ? item.IMFS_sie["750"]
                        : 0}
                    </td>
                    <td>
                      {item.IMFS_sie && item.IMFS_sie["375"]
                        ? item.IMFS_sie["375"]
                        : 0}
                    </td>
                    <td>
                      {item.IMFS_sie && item.IMFS_sie["180"]
                        ? item.IMFS_sie["180"]
                        : 0}
                    </td>
                    <td>{item.IMFS_total_bottle}</td>
                    <td>{item.IMFS_total_value}</td>
                    <td>
                      {item.Beer_size && item.Beer_size["650"]
                        ? item.Beer_size["650"]
                        : 0}
                    </td>
                    <td>
                      {item.Beer_size && item.Beer_size["500"]
                        ? item.Beer_size["500"]
                        : 0}
                    </td>
                    <td>
                      {item.Beer_size && item.Beer_size["325"]
                        ? item.Beer_size["325"]
                        : 0}
                    </td>
                    <td>{item.Beer_total_bottle}</td>
                    <td>{item.Beer_total_value}</td>
                    <td>{item.Total_Bottle}</td>
                    <td>{item.Total_amount}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="bg-warning">
                <td colSpan={3}>{grandTotals.Invoice}</td>
                <td>{grandTotals.IMFS_case}</td>
                <td>{grandTotals.Beer_Case}</td>
                <td>{grandTotals.Total_Case}</td>
                <td>{grandTotals.IMFS_sie_1000}</td>
                <td>{grandTotals.IMFS_sie_750}</td>
                <td>{grandTotals.IMFS_sie_375}</td>
                <td>{grandTotals.IMFS_sie_180}</td>
                <td>{grandTotals.IMFS_total_bottle}</td>
                <td>{grandTotals.IMFS_total_value}</td>
                <td>{grandTotals.Beer_size_650}</td>
                <td>{grandTotals.Beer_size_500}</td>
                <td>{grandTotals.Beer_size_325}</td>
                <td>{grandTotals.Beer_total_bottle}</td>
                <td>{grandTotals.Beer_total_value}</td>
                <td>{grandTotals.Total_Bottle}</td>
                <td>{grandTotals.Total_amount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
