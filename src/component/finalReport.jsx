import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Dashboard from "../dashboard/Dashboard";
import { ToastContainer } from "react-toastify";
import axios from "axios";

function FinalReport({ Base_url }) {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDetails, setFormDetails] = useState([]);
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
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
          navigate("/"); // Replace with the path to your login page
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
        navigate("/"); // Replace with the path to your login page
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  const exportToExcels = (data) => {
    const groupedData = {};

    // Group data by 'Product'
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

    // Add header content
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

    // Add data for each product
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

      // Add product-wise total
      dataForExcel.push([
        `TOTAL ${productName.toUpperCase()}`,
        "",
        "",
        "",
        groupedData[productName].totalBottles,
        groupedData[productName].totalValue,
      ]);

      // Update grand totals
      grandTotalBottles += groupedData[productName].totalBottles;
      grandTotalValue += groupedData[productName].totalValue;

      // Add an empty row for separation
      dataForExcel.push([]);
    }

    // Add product-wise totals
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

    // Add grand total at the end
    dataForExcel.push([
      "GRAND TOTAL",
      "",
      "",
      "",
      grandTotalBottles,
      grandTotalValue,
    ]);

    // Add footer
    dataForExcel.push(["", "", "", "", ""]);
    dataForExcel.push([
      "Verification Supervisor Signature",
      "",
      "",
      "",
      "Shop Supervisor Signature",
    ]);

    // Create a new workbook and sheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    worksheet["!cols"] = [
      { wch: 50 }, // Width of the "Brand name" column
      { wch: 15 }, // Width of the "Item code" column
      { wch: 10 }, // Width of the "Size" column
      { wch: 10 }, // Width of the "MRP" column
      { wch: 15 }, // Width of the "Total bottle" column
      { wch: 15 }, // Width of the "Total value" column
    ];
    // Append sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Details");

    // Save workbook as Excel file
    XLSX.writeFile(workbook, "Daily_Stock_Details.xlsx");
  };

  const handleClick = () => {
    exportToExcels(data);
  };

  const renderTableRows = (data) => {
    // Initialize grouped data object
    const groupedData = {};

    // Group data by Product
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

    // Iterate over each product category
    for (const productName in groupedData) {
      // Rows for individual items under the product category
      groupedData[productName].data.forEach((item, index) => {
        rows.push(
          <tr key={`${productName}-${index}`}>
            <td>{index + 1}</td>
            <td>{item.Description || ""}</td>
            <td>{item.Item_Code}</td>
            <td>{item.Size || ""}</td>
            <td>{item.MRP_Value || ""}</td>
            <td>{item.Closing_bottle || 0}</td>
            <td>{item.Closing_value || 0}</td>
          </tr>
        );
      });

      // Product-wise total row
      rows.push(
        <tr key={`${productName}-total`} style={{ fontWeight: "bold" }}>
          <td colSpan={5}>{`TOTAL ${productName.toUpperCase()}`}</td>
          <td>{groupedData[productName].totalBottles}</td>
          <td>{groupedData[productName].totalValue}</td>
        </tr>
      );

      // Add a spacer row
      rows.push(
        <tr key={`${productName}-spacer`}>
          <td colSpan={7}></td>
        </tr>
      );
    }

    // Grand total row
    rows.push(
      <tr key="grand-total" style={{ fontWeight: "bold" }}>
        <td colSpan={5}>GRAND TOTAL</td>
        <td>
          {data.reduce((acc, item) => acc + (item.Closing_bottle || 0), 0)}
        </td>
        <td>
          {data.reduce((acc, item) => acc + (item.Closing_value || 0), 0)}
        </td>
      </tr>
    );

    return rows;
  };

  const handleSearch = async () => {
    const filt = formDetails.filter((d) => d.Date.substring(0, 10) === date);
    setData(filt);
  };

  return (
    <div className="m-2">
      {/* <Dashboard /> */}
      <ToastContainer />

      <div>
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <button onClick={handleSearch}>Search</button>
        </div>
        <button onClick={() => exportToExcels(data)}>Export to Excel</button>
        <div className="table-container">
          <table className="table table-dark table-bordered border border-primary p-2 m-4">
            <thead>
              <tr>
                <th>S.no</th>
                <th>Brand Name</th>
                <th>Item Code</th>
                <th>Size</th>
                <th>New Rate</th>
                <th>Closing Bottles</th>
                <th>Closing Values</th>
              </tr>
            </thead>
            <tbody>{renderTableRows(data)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FinalReport;
