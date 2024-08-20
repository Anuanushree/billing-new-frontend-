import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Typography,
} from "@mui/material";
import axios from "axios";
import Cookies from "cookies-js";
import { ToastContainer } from "react-toastify";
import ExcelJS from "exceljs";

function FinalReport({ Base_url }) {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDetails, setFormDetails] = useState([]);

  const id = Cookies.get("id");
  const token = Cookies.get("token");
  const storeName = Cookies.get("storeName");
  const headers = { headers: { authorization: `${token}` } };

  useEffect(() => {
    const get1 = async () => {
      try {
        const response = await axios.get(
          `${Base_url}/user/getdailyData`,
          headers
        );
        setFormDetails(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // navigate("/"); // Replace with the path to your login page
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };
    get1();
  }, []);

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    try {
      const response = await axios.get(`${Base_url}/user/getData`, headers);
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // navigate("/"); // Replace with the path to your login page
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  const exportToExcels = (data) => {
    const groupedData = {};

    const storeName = Cookies.get("storeName") || "Unknown Store";

    data.forEach((item) => {
      const productName = item.Product || "Unknown Product";

      if (!groupedData[productName]) {
        groupedData[productName] = {
          data: [],
          totalBottles: 0,
          totalValue: 0,
        };
      }

      const totalBottle = item.Closing_bottle || 0;
      const totalValue = item.Closing_value || 0;

      groupedData[productName].data.push({
        "Brand Name": item.Description || "",
        "Item Code": item.Item_Code,
        Size: item.Size || "",
        "New Rate": item.MRP_Value || "",
        "Closing Bottles": totalBottle,
        "Closing Values": totalValue,
      });

      groupedData[productName].totalBottles += totalBottle;
      groupedData[productName].totalValue += totalValue;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Details");

    // Add and merge header rows
    const headerRow1 = worksheet.addRow([
      "TAMIL NADU STATE MARKETING CORPORATION LIMITED",
    ]);
    worksheet.mergeCells(headerRow1.number, 1, headerRow1.number, 6); // Adjust column range as needed
    headerRow1.alignment = { horizontal: "center", vertical: "middle" };
    headerRow1.font = { bold: true };

    const headerRow2 = worksheet.addRow([
      "B-4, Ambattur Industrial Estate, Chennai (South) District, Chennai - 58.",
    ]);
    worksheet.mergeCells(headerRow2.number, 1, headerRow2.number, 6); // Adjust column range as needed
    headerRow2.alignment = { horizontal: "center", vertical: "middle" };
    headerRow2.font = { bold: true };

    const headerRow3 = worksheet.addRow([
      `CLOSING STOCK DETAILS AS ON ${date} 2021 SHOP NO ${storeName}`,
    ]);
    worksheet.mergeCells(headerRow3.number, 1, headerRow3.number, 6); // Adjust column range as needed
    headerRow3.alignment = { horizontal: "center", vertical: "middle" };
    headerRow3.font = { bold: true };
    // Add table header with center alignment
    const headerRow = worksheet.addRow([
      "Brand Name",
      "Item Code",
      "Size",
      "New Rate",
      "Closing Bottles",
      "Closing Values",
    ]);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { bold: true };
    });

    let grandTotalBottles = 0;
    let grandTotalValue = 0;

    // Set row heights
    const rowHeight = 30; // Adjust height as needed

    for (const productName in groupedData) {
      groupedData[productName].data.forEach((item) => {
        const row = worksheet.addRow([
          item["Brand Name"],
          item["Item Code"],
          item.Size,
          item["New Rate"],
          item["Closing Bottles"],
          item["Closing Values"],
        ]);
        row.height = rowHeight;
      });

      const totalRow = worksheet.addRow([
        `TOTAL ${productName.toUpperCase()}`,
        "",
        "",
        "",
        groupedData[productName].totalBottles,
        groupedData[productName].totalValue,
      ]);
      totalRow.font = { bold: true };
      totalRow.height = rowHeight;

      grandTotalBottles += groupedData[productName].totalBottles;
      grandTotalValue += groupedData[productName].totalValue;

      worksheet.addRow([]).height = rowHeight;
    }

    const productWiseTotalsRow = worksheet.addRow(["PRODUCT-WISE TOTALS"]);
    productWiseTotalsRow.font = { bold: true };
    productWiseTotalsRow.height = rowHeight;

    for (const productName in groupedData) {
      worksheet.addRow([
        productName.toUpperCase(),
        "",
        "",
        "",
        groupedData[productName].totalBottles,
        groupedData[productName].totalValue,
      ]).height = rowHeight;
    }
    worksheet.addRow([]).height = rowHeight;

    worksheet.addRow([
      "GRAND TOTAL",
      "",
      "",
      "",
      grandTotalBottles,
      grandTotalValue,
    ]).font = { bold: true }.height = rowHeight;

    worksheet.addRow(["", "", "", "", ""]).height = rowHeight;
    worksheet.addRow([
      "Verification Supervisor Signature",
      "",
      "",
      "",
      "Shop Supervisor Signature",
    ]).height = rowHeight;

    // Apply border to the table
    worksheet.eachRow((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Set column widths
    worksheet.columns = [
      { width: 30 }, // Adjust column widths as needed
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
    ];

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Daily_Stock_Details.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };
  const handleClick = () => {
    exportToExcels(data);
  };

  const renderTableRows = (data) => {
    const groupedData = {};
    let grandTotalBottles = 0;
    let grandTotalValue = 0;

    data.forEach((item) => {
      const productName = item.Product || "Unknown Product";

      if (!groupedData[productName]) {
        groupedData[productName] = {
          data: [],
          totalBottles: 0,
          totalValue: 0,
        };
      }

      const totalBottle = item.Closing_bottle || 0;
      const totalValue = item.Closing_value || 0;

      groupedData[productName].data.push(item);
      groupedData[productName].totalBottles += totalBottle;
      groupedData[productName].totalValue += totalValue;
    });

    const rows = [];

    for (const productName in groupedData) {
      groupedData[productName].data.forEach((item, index) => {
        rows.push(
          <TableRow key={`${productName}-${index}`}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{item.Description || ""}</TableCell>
            <TableCell>{item.Item_Code}</TableCell>
            <TableCell>{item.Size || ""}</TableCell>
            <TableCell>{item.MRP_Value || ""}</TableCell>
            <TableCell>{item.Closing_bottle || 0}</TableCell>
            <TableCell>{item.Closing_value || 0}</TableCell>
          </TableRow>
        );
      });

      rows.push(
        <TableRow key={`${productName}-total`} style={{ fontWeight: "bold" }}>
          <TableCell
            colSpan={5}
          >{`TOTAL ${productName.toUpperCase()}`}</TableCell>
          <TableCell>{groupedData[productName].totalBottles}</TableCell>
          <TableCell>{groupedData[productName].totalValue}</TableCell>
        </TableRow>
      );

      grandTotalBottles += groupedData[productName].totalBottles;
      grandTotalValue += groupedData[productName].totalValue;

      rows.push(
        <TableRow key={`${productName}-spacer`}>
          <TableCell colSpan={7}></TableCell>
        </TableRow>
      );
    }

    for (const productName in groupedData) {
      rows.push(
        <TableRow style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
          <TableCell colSpan={5}>{`${productName}`}</TableCell>
          <TableCell>{groupedData[productName].totalBottles}</TableCell>
          <TableCell>{groupedData[productName].totalValue}</TableCell>
        </TableRow>
      );
    }
    rows.push(
      <TableRow key="grand-total" style={{ fontWeight: "bold" }}>
        <TableCell colSpan={5}>GRAND TOTAL</TableCell>
        <TableCell>{grandTotalBottles}</TableCell>
        <TableCell>{grandTotalValue}</TableCell>
      </TableRow>
    );

    return rows;
  };

  const handleSearch = async () => {
    const filt = formDetails.filter((d) => d.Date.substring(0, 10) === date);
    setData(filt);
  };

  return (
    <Container>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        PV Report
      </Typography>
      <div style={{ marginBottom: "16px" }}>
        <TextField
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ marginRight: "16px" }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClick}
          style={{ marginLeft: "16px" }}
        >
          Export to Excel
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.no</TableCell>
              <TableCell>Brand Name</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>New Rate</TableCell>
              <TableCell>Closing Bottles</TableCell>
              <TableCell>Closing Values</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderTableRows(data)}</TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default FinalReport;
