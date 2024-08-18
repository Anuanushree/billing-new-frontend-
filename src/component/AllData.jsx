import React, { useEffect, useState } from "react";
import Dashboard from "../dashboard/Dashboard";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

function AllData({ Base_url }) {
  const [formDetails, setFormDetails] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState([]);
  const [initial, setInotial] = useState("");
  const handleClick = () => {
    exportToExcel(formDetails);
  };

  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  const headers = {
    headers: { authorization: `${token}` },
  };

  const get1 = async () => {
    try {
      const response = await axios.get(`${Base_url}/user/getData`, headers);
      const fil = response.data
        .filter((f) => f.Total_bottle > 0)
        .map((item) => {
          const newDate = new Date(item.Date);
          newDate.setDate(newDate.getDate() + 1);
          return { ...item, Date: newDate.toISOString().split("T")[0] };
        });
      console.log(fil);
      setFormDetails(fil);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/"); // Replace '/login' with the path to your login page
      } else {
        // Handle other errors
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    get1();
  }, [initial]);
  const handleSearch = async () => {
    const get = async () => {
      try {
        const response = await axios.get(
          `${Base_url}/user/getdailyData`,
          headers
        );
        const filt = response.data.filter(
          (d) => d.Date.substring(0, 10) === date
        );
        console.log(filt);
        setFormDetails(filt);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching daily data:", error);
      }
    };
    get();
    const filt = data.filter((d) => d.Date.substring(0, 10) === date);
    setFormDetails(filt);
  };

  const totalClosingValue = formDetails.reduce(
    (total, item) => total + item.Closing_value,
    0
  );
  const totalOpeningBottle = formDetails.reduce(
    (total, item) => total + item.Opening_bottle,
    0
  );
  const totalReciptBottle = formDetails.reduce(
    (total, item) => total + item.Receipt_bottle,
    0
  );
  const totalOpeningValue = formDetails.reduce(
    (total, item) => total + item.Opening_value,
    0
  );
  const totalReceiptValue = formDetails.reduce(
    (total, item) => total + item.Receipt_value,
    0
  );
  const totalSalesBottle = formDetails.reduce(
    (total, item) => total + item.Sales_bottle,
    0
  );
  const totalSalesValue = formDetails.reduce(
    (total, item) => total + item.Sale_value,
    0
  );
  const totalClosingBottle = formDetails.reduce(
    (total, item) => total + item.Closing_bottle,
    0
  );
  const totalValue = formDetails.reduce(
    (total, item) => total + item.Total_value,
    0
  );
  const totalBottle = formDetails.reduce(
    (total, item) => total + item.Total_bottle,
    0
  );
  const totalCase = formDetails.reduce((total, item) => total + item.Case, 0);
  const totalLoose = formDetails.reduce((total, item) => total + item.Loose, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  function exportToExcel(data) {
    const cleanedData = data.map((item) => {
      const { _id, __v, updatedAt, ...rest } = item;
      const parsedDate = new Date(rest.Date);
      const formattedDate = `${String(parsedDate.getDate()).padStart(
        2,
        "0"
      )}/${String(parsedDate.getMonth() + 1).padStart(
        2,
        "0"
      )}/${parsedDate.getFullYear()}`;
      return {
        Date: formattedDate,
        Range: rest.Range,
        Product: rest.Product,
        "Brand name": rest.Description, // Assuming Description is the brand name
        "Item code": rest.Item_Code,
        Size: rest.Size,
        MRP: rest.MRP_Value,
        "Opening Bottle": rest.Opening_bottle,
        "Opening value": rest.Opening_value,
        "Receipt Bottle": rest.Receipt_bottle || 0,
        "Receipt value": rest.Receipt_value || 0,
        "Total value": rest.Total_value,
        "Total Bottle": rest.Total_bottle,
        Case: rest.Case,
        Loose: rest.Loose,
        "Closing bottle": rest.Closing_bottle,
        "Sales Bottle": rest.Sales_bottle,
        "Sales Value": rest.Sale_value,
        "Closing value": rest.Closing_value,
        "Item type": rest.Item_type,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 10 }, // Width of the "Date" column
      { wch: 10 }, // Width of the "Range" column
      { wch: 20 }, // Width of the "Product" column
      { wch: 30 }, // Width of the "Brand name" column
      // Add widths for other columns as needed
    ];

    // Apply bold style to headers if they exist
    const boldCellStyle = { font: { bold: true } };
    ["A1", "B1", "C1", "D1"].forEach((cellAddress) => {
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = boldCellStyle;
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `Daily statement ${date}.xlsx`);
  }

  const handleAllDate = () => {
    setFormDetails(data);
    setDate(Date.now());
  };

  return (
    <div className="m-2">
      {/* <Dashboard /> */}
      <div className="table-container">
        <table className="table table-dark table-bordered border border-primary p-2 m-4">
          <thead>
            <tr>
              <th>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </th>
              <th>
                <button onClick={handleSearch}>Search</button>
              </th>
              <th colSpan={3}>
                <button onClick={handleAllDate}>All data</button>
              </th>
              <th colSpan={6}>
                <button onClick={handleClick}>Export to Excel</button>
              </th>
            </tr>
          </thead>
          <thead className="table-secondary border-danger">
            <tr>
              <th>Date</th>
              <th>Range</th>
              <th>Product</th>
              <th>Brand name</th>
              <th>Item code</th>
              <th>Size</th>
              <th>MRP</th>
              <th>Opening Bottle</th>
              <th>Opening value</th>
              <th>Receipt Bottle</th>
              <th>Receipt value</th>
              <th>Total value</th>
              <th>Total Bottle</th>
              <th>Case</th>
              <th>Loose</th>
              <th>Closing bottle</th>
              <th>Sales Bottle</th>
              <th>Sales Value</th>
              <th>Closing value</th>
              <th>Item type</th>
            </tr>
          </thead>

          {formDetails
            .sort((a, b) => new Date(a.Date) - new Date(b.Date))
            .sort((a, b) => {
              // First, sort by Product
              const productComparison = a.Product.localeCompare(b.Product);
              if (productComparison !== 0) {
                // If Products are different, return the comparison result
                return productComparison;
              } else {
                // If Products are the same, sort by Description
                return a.Description.localeCompare(b.Description);
              }
            })
            .map((d, i) => (
              <tbody key={i}>
                <tr>
                  <td>{new Date(d.Date).toLocaleDateString("en-GB")}</td>
                  <td>{d.Range}</td>
                  <td>{d.Product}</td>
                  <td>{d.Description}</td>
                  <td>{d.Item_Code}</td>
                  <td>{d.Size}</td>
                  <td>{d.MRP_Value}</td>
                  <td>{d.Opening_bottle}</td>
                  <td>{d.Opening_value}</td>
                  <td>{d.Receipt_bottle ? d.Receipt_bottle : 0}</td>
                  <td>{d.Receipt_value ? d.Receipt_value : 0}</td>
                  <td>{d.Total_value}</td>
                  <td>{d.Total_bottle}</td>
                  <td>{d.Case}</td>
                  <td>{d.Loose}</td>
                  <td>{d.Closing_bottle}</td>
                  <td>{d.Sales_bottle} </td>
                  <td>{d.Sale_value}</td>
                  <td>{d.Closing_value}</td>
                  <td>{d.Item_type}</td>
                </tr>
              </tbody>
            ))}

          <tfoot>
            <tr>
              <td colSpan={7}>Total</td>
              <td>{totalOpeningBottle}</td>
              <td>{totalOpeningValue}</td>
              <td>{totalReciptBottle}</td>
              <td>{totalReceiptValue}</td>
              <td>{totalValue}</td>
              <td>{totalBottle}</td>
              <td>{totalCase}</td>
              <td>{totalLoose}</td>
              <td>{totalClosingBottle}</td>
              <td>{totalSalesBottle}</td>
              <td>{totalSalesValue}</td>
              <td>{totalClosingValue}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default AllData;
