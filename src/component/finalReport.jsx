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

function FinalReport({ Base_url }) {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDetails, setFormDetails] = useState([]);

  const id = Cookies.get("id");
  const token = Cookies.get("token");
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

    const dataForExcel = [];

    dataForExcel.push(["TAMIL NADU STATE MARKETING CORPORATION LIMITED"]);
    dataForExcel.push([
      "B-4, Ambattur Industrial Estate, Chennai (South) District, Chennai - 58.",
    ]);
    dataForExcel.push(["CLOSING STOCK DETAILS AS ON 30 JUNE 2021 SHOP NO 928"]);
    dataForExcel.push([
      "Brand Name",
      "Item Code",
      "Size",
      "New Rate",
      "Closing Bottles",
      "Closing Values",
    ]);

    let grandTotalBottles = 0;
    let grandTotalValue = 0;

    for (const productName in groupedData) {
      groupedData[productName].data.forEach((item) => {
        dataForExcel.push([
          item["Brand Name"],
          item["Item Code"],
          item.Size,
          item["New Rate"],
          item["Closing Bottles"],
          item["Closing Values"],
        ]);
      });

      dataForExcel.push([
        `TOTAL ${productName.toUpperCase()}`,
        "",
        "",
        "",
        groupedData[productName].totalBottles,
        groupedData[productName].totalValue,
      ]);

      grandTotalBottles += groupedData[productName].totalBottles;
      grandTotalValue += groupedData[productName].totalValue;

      dataForExcel.push([]);
    }

    dataForExcel.push(["PRODUCT-WISE TOTALS"]);
    for (const productName in groupedData) {
      dataForExcel.push([
        productName.toUpperCase(),
        "",
        "",
        "",
        groupedData[productName].totalBottles,
        groupedData[productName].totalValue,
      ]);
    }
    dataForExcel.push([]);

    dataForExcel.push([
      "GRAND TOTAL",
      "",
      "",
      "",
      grandTotalBottles,
      grandTotalValue,
    ]);

    dataForExcel.push(["", "", "", "", ""]);
    dataForExcel.push([
      "Verification Supervisor Signature",
      "",
      "",
      "",
      "Shop Supervisor Signature",
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    worksheet["!cols"] = [
      { wch: 50 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Details");

    XLSX.writeFile(workbook, "Daily_Stock_Details.xlsx");
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
