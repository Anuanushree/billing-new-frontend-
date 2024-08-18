import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import Dashboard from "../dashboard/Dashboard";

function SalesMessage({ Base_url }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totals, setTotals] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [today, setToday] = useState("");
  const [datas, setDatas] = useState([]);

  const token = localStorage.getItem("token");
  const headers = {
    headers: { authorization: `${token}` },
  };

  useEffect(() => {
    // Set today's date
    setToday(new Date().toISOString().split("T")[0]);

    const getData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/getData`, headers);
        // console.log(response.data);
        const response2 = await axios.get(
          `${Base_url}/user/getdailyData`,
          headers
        );
        setDatas(response2.data);
        const submit = response.data.filter(
          (d) => d.isSubmit == true && d.Date.substring(0, 10) === date
        );

        console.log(submit);
        if (submit.length > 10) {
          const response1 = await axios.get(
            `${Base_url}/user/getdailyData`,
            headers
          );
          const filteredData = response1.data.filter(
            (d) => d.Date.substring(0, 10) === date
          );
          setData(filteredData);
          console.log(data, "data");
          // console.log(data);
        } else {
          setData(response.data);
          console.log(data);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/"); // Replace '/login' with the path to your login page
        } else {
          // Handle other errors
          console.error("Error fetching data:", error);
        }
      }
    };
    console.log(data);
    const getBankData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/bank`, headers);
        const filteredData = response.data.filter(
          (d) => d.Date.substring(0, 10) === date
        );
        // setDatas(filteredData);
        setFilteredData(filteredData);
        console.log(filteredData, "filter");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/"); // Replace '/login' with the path to your login page
        } else {
          // Handle other errors
          console.error("Error fetching data:", error);
        }
      }
    };

    getData();
    getBankData();
  }, []);

  // console.log(data);
  useEffect(() => {
    const calculateTotals = (data, filteredData) => {
      const newTotals = {
        // existing totals
        "1000 ML": 0,
        "750 ML": 0,
        "375 ML": 0,
        "180 ML": 0,
        "BEER 650 ML": 0,
        "BEER 500 ML": 0,
        "BEER 325 ML": 0,
        "IMFL VALUE": 0,
        "BEER VALUE": 0,
        BANK: 0,
        "POS CARD": 0,
        "SALES VALUE": 0,

        "Ordinary closing bottle": 0,
        "Medium closing bottle": 0,
        "Premium closing bottle": 0,

        "BEER 650 ML closing bottle": 0,
        "BEER 500 ML closing bottle": 0,
        "BEER 325 ML closing bottle": 0,

        "Total closing Stock value": 0,

        // Added entry for receipt cases
        "Ordinary receipt case": 0, // Added entry for receipt cases
        "Medium receipt case": 0, // Added entry for receipt cases
        "Premium receipt case": 0, // Added entry for receipt cases
        "Total receipt case": 0,

        "BEER 650 ML receipt case": 0, // Added entry for receipt cases
        "BEER 500 ML receipt case": 0, // Added entry for receipt cases
        "BEER 325 ML receipt case": 0,
        "Total Beer receipt": 0,

        "Ordinary sales case": 0,
        "Medium sales case": 0,
        "Premium sales case": 0,
        "sale Case Total": 0,

        "BEER 650 ML sales case": 0,
        "BEER 500 ML sales case": 0,
        "BEER 325 ML sales case": 0,
        "total beer Case": 0,

        "ORDINARY CLOSING VALUE": 0,
        "MEDIUM CLOSING VALUE": 0,
        "PREMIUM CLOSING VALUE": 0,
        "BEER CLOSING VALUE": 0,
      };

      let totalSalesBottles = 0;
      let ordinaryClosingValue = 0;
      let mediumClosingValue = 0;
      let premiumClosingValue = 0;
      let beerClosingValue = 0;
      let totalSalesValue = 0;
      let totalClosingValue = 0;
      let totalReceiptBottles = 0;
      let premiumSalesCases = 0;
      let total180mlBottles = 0;
      let total375mlBottles = 0;
      let total750mlBottles = 0;
      let total1000mlBottles = 0;

      data.forEach((item) => {
        const size = item.Size;
        const Range = item.Range;
        // console.log(Range);
        const salesBottle = item.Sales_bottle || 0;
        const receiptBottle = item.Receipt_bottle || 0; // Added receipt bottle handling
        const saleValue = item.Sale_value || 0;
        const closingValue = item.Closing_value || 0;
        const closingBottle = item.Closing_bottle || 0;

        // totalSalesBottles += salesBottle;
        // totalReceiptBottles += receiptBottle; // Aggregate receipt bottles
        totalSalesValue += saleValue;
        totalClosingValue += closingValue;
        var s = 0;
        switch (Range) {
          case "Premium":
            if (size == 180) {
              // console.log(salesBottle, "salesbottle");
              newTotals["Premium receipt case"] += Math.round(
                receiptBottle / 48
              );
              // newTotals["Premium sales case"] += Math.round(salesBottle / 48);
              total180mlBottles += salesBottle;
              s += Math.round(salesBottle / 48);
              newTotals["Premium closing bottle"] += Math.round(
                closingBottle / 48
              );
            } else if (size == 375) {
              s += Math.round(salesBottle / 24);
              newTotals["Premium receipt case"] += Math.round(
                receiptBottle / 24
              );
              // newTotals["Premium sales case"] += Math.round(salesBottle / 24);
              total375mlBottles += salesBottle;
              newTotals["Premium closing bottle"] += Math.round(
                closingBottle / 24
              );
            } else if (size == 1000) {
              newTotals["Premium receipt case"] += Math.round(
                receiptBottle / 9
              );
              s += Math.round(salesBottle / 9);
              // newTotals["Premium sales case"] += Math.round(salesBottle / 9);
              total1000mlBottles += salesBottle;
              newTotals["Premium closing bottle"] += Math.round(
                closingBottle / 9
              );
            } else if (size == 750) {
              newTotals["Premium receipt case"] += Math.round(
                receiptBottle / 12
              );
              s += Math.round(salesBottle / 12);
              // newTotals["Premium sales case"] += Math.round(salesBottle / 12);
              total750mlBottles += salesBottle;
              newTotals["Premium closing bottle"] += Math.round(
                closingBottle / 12
              );
            }

            premiumClosingValue += closingValue;
            newTotals["IMFL VALUE"] += saleValue;

            // console.log(salesBottle, "sale premium bottle");
            break;
          case "Ordinary":
            if (size == 180) {
              newTotals["Ordinary receipt case"] += Math.round(
                receiptBottle / 48
              );

              newTotals["Ordinary sales case"] += Math.round(salesBottle / 48);

              newTotals["Ordinary closing bottle"] += Math.round(
                closingBottle / 48
              );
            } else if (size == 375) {
              newTotals["Ordinary receipt case"] += Math.round(
                receiptBottle / 24
              );

              newTotals["Ordinary sales case"] += Math.round(salesBottle / 24);

              newTotals["Ordinary closing bottle"] += Math.round(
                closingBottle / 24
              );
            } else if (size == 750) {
              newTotals["Ordinary receipt case"] += Math.round(
                receiptBottle / 12
              );

              newTotals["Ordinary sales case"] += Math.round(salesBottle / 12);

              newTotals["Ordinary closing bottle"] += Math.round(
                closingBottle / 12
              );
            } else if (size == 1000) {
              newTotals["Ordinary receipt case"] += Math.round(
                receiptBottle / 9
              );

              newTotals["Ordinary sales case"] += Math.round(salesBottle / 9);

              newTotals["Ordinary closing bottle"] += Math.round(
                closingBottle / 9
              );
            }

            newTotals["IMFL VALUE"] += saleValue;

            ordinaryClosingValue += closingValue;

            break;
          case "Medium":
            if (size == 180) {
              newTotals["Medium receipt case"] += Math.round(
                receiptBottle / 48
              ); // Convert receipt bottles to cases

              newTotals["Medium sales case"] += Math.round(salesBottle / 48);
              newTotals["Medium closing bottle"] += Math.round(
                closingBottle / 48
              );
            } else if (size == 375) {
              newTotals["Medium receipt case"] += Math.round(
                receiptBottle / 24
              ); // Convert receipt bottles to cases

              newTotals["Medium sales case"] += Math.round(salesBottle / 24);
              newTotals["Medium closing bottle"] += Math.round(
                closingBottle / 24
              );
            } else if (size == 750) {
              newTotals["Medium receipt case"] += Math.round(
                receiptBottle / 12
              ); // Convert receipt bottles to cases

              newTotals["Medium sales case"] += Math.round(salesBottle / 12);
              newTotals["Medium closing bottle"] += Math.round(
                closingBottle / 12
              );
            }
            if (size == 1000) {
              newTotals["Medium receipt case"] += Math.round(receiptBottle / 9); // Convert receipt bottles to cases

              newTotals["Medium sales case"] += Math.round(salesBottle / 9);
              newTotals["Medium closing bottle"] += Math.round(
                closingBottle / 9
              );
            }
            newTotals["IMFL VALUE"] += saleValue;
            mediumClosingValue += closingValue;

            break;
          default:
            break;
        }
        console.log(s, "s");
        switch (size) {
          case 1000:
            newTotals["1000 ML"] += salesBottle;

            break;
          case 750:
            newTotals["750 ML"] += salesBottle;

            break;
          case 375:
            newTotals["375 ML"] += salesBottle;

            break;
          case 180:
            newTotals["180 ML"] += salesBottle;

            break;
          case 650:
            newTotals["BEER 650 ML"] += salesBottle;
            newTotals["BEER 650 ML receipt case"] += Math.round(
              receiptBottle / 12
            ); // Convert receipt bottles to cases
            newTotals["BEER VALUE"] += saleValue;
            newTotals["BEER 650 ML sales case"] += Math.round(salesBottle / 12);
            beerClosingValue += closingValue;
            newTotals["BEER 650 ML closing bottle"] += Math.round(
              closingBottle / 12
            );
            break;
          case 500:
            newTotals["BEER 500 ML"] += salesBottle;
            newTotals["BEER 500 ML receipt case"] += Math.round(
              receiptBottle / 24
            ); // Convert receipt bottles to cases
            newTotals["BEER VALUE"] += saleValue;
            newTotals["BEER 500 ML sales case"] += Math.round(salesBottle / 24);
            beerClosingValue += closingValue;
            newTotals["BEER 500 ML closing bottle"] += Math.round(
              closingBottle / 24
            );
            break;
          case 325:
            newTotals["BEER 325 ML"] += salesBottle;
            newTotals["BEER 325 ML receipt case"] += Math.round(
              receiptBottle / 24
            ); // Convert receipt bottles to cases
            newTotals["BEER VALUE"] += saleValue;
            newTotals["BEER 325 ML sales case"] += Math.round(salesBottle / 24);
            beerClosingValue += closingValue;
            newTotals["BEER 325 ML closing bottle"] += Math.round(
              closingBottle / 24
            );
            break;
          default:
            break;
        }
      });

      filteredData.forEach((item) => {
        newTotals["BANK"] += item.Bank || 0;
        newTotals["POS CARD"] += item.Pos || 0;
        newTotals["SALES VALUE"] += item.Sale || 0;
      });
      premiumSalesCases += Math.round(total180mlBottles / 48);
      premiumSalesCases += Math.round(total375mlBottles / 24);
      premiumSalesCases += Math.round(total750mlBottles / 12);
      premiumSalesCases += Math.round(total1000mlBottles / 9);

      newTotals["Premium sales case"] = premiumSalesCases;
      var totalReceipt =
        newTotals["Medium receipt case"] +
        newTotals["Ordinary receipt case"] +
        newTotals["Premium receipt case"];

      var totalBeerReceipt =
        newTotals["BEER 650 ML receipt case"] + // Added entry for receipt cases
        newTotals["BEER 500 ML receipt case"] + // Added entry for receipt cases
        newTotals["BEER 325 ML receipt case"];

      var totalsale =
        newTotals["Ordinary sales case"] +
        newTotals["Medium sales case"] +
        newTotals["Premium sales case"];

      var totalBeerSale =
        newTotals["BEER 650 ML sales case"] +
        newTotals["BEER 500 ML sales case"] +
        newTotals["BEER 325 ML sales case"];

      newTotals["total beer Case"] = totalBeerSale;
      newTotals["sale Case Total"] = totalsale;

      newTotals["Total Beer receipt"] = totalBeerReceipt;
      newTotals["Total receipt case"] = totalReceipt;
      newTotals["Total closing Stock value"] = totalClosingValue;
      // Added total receipt bottles
      newTotals["ORDINARY CLOSING VALUE"] = ordinaryClosingValue;
      newTotals["MEDIUM CLOSING VALUE"] = mediumClosingValue;
      newTotals["PREMIUM CLOSING VALUE"] = premiumClosingValue;
      newTotals["BEER CLOSING VALUE"] = beerClosingValue;
      // Calculate balance

      return newTotals;
    };

    const totals = calculateTotals(data, filteredData);
    setTotals(totals);
  }, [data, filteredData]);

  const day = new Date(date).getDate();

  const formattedTotals =
    day +
    Object.values(totals)
      .map((value) => `*${value}`)
      .join("");

  const handleSearch = () => {
    const filteredData = datas.filter((d) => d.Date.substring(0, 10) === date);
    setData(filteredData);
  };
  return (
    <div id="wrapper">
      {/* <Dashboard /> */}
      <div style={{ width: "50%" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>{date}</TableCell>
              </TableRow>
              {Object.entries(totals).map(([category, value]) => (
                <TableRow key={category}>
                  <TableCell>{category}</TableCell>
                  <TableCell>{value}</TableCell>{" "}
                  {/* Format value to 2 decimal places */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Card
          sx={{
            width: "100%", // Adjust to fit the available space
            maxHeight: "none",
            height: "auto",
            padding: "16px",
            overflow: "auto", // This will add a scrollbar if content exceeds height
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              component="div"
              style={{
                wordWrap: "break-word", // Ensures long text will wrap to the next line
                fontSize: "1rem", // Adjust font size as needed
              }}
            >
              {formattedTotals}
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SalesMessage;
