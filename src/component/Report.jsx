import React, { useEffect, useState, useMemo } from "react";
import Dashboard from "../dashboard/Dashboard";
import Sample from "./sample";
import axios from "axios";
import "./sample.css";

function Report({ Base_url }) {
  const [formDetails, setFormDetails] = useState([]);
  const [data, setData] = useState([]);
  const [datas, setDatas] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  const headers = {
    headers: { authorization: `${token}` },
  };

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/getData`, headers);

        const submit = response.data.filter(
          (d) => d.isSubmit == true && d.Date.substring(0, 10) === date
        );

        if (submit > 10) {
          const response1 = await axios.get(
            `${Base_url}/user/getdailyData`,
            headers
          );
          const filteredData = response1.data.filter(
            (d) => d.Date.substring(0, 10) === date
          );
          setFormDetails(filteredData);
          console.log(formDetails);
        } else {
          setFormDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching form details", error);
      }
    };
    fetchFormDetails();
  }, []);
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const response1 = await axios.get(
          `${Base_url}/user/getdailyData`,
          headers
        );

        setData(response1.data);
      } catch (error) {
        console.error("Error fetching daily data", error);
      }
    };
    fetchDailyData();
  }, [date]);

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/bank`, headers);
        const filteredData = response.data.filter(
          (d) => d.Date.substring(0, 10) === date
        );
        setDatas(filteredData);
        console.log(filteredData, "bank");
      } catch (error) {
        console.error("Error fetching bank data", error);
      }
    };
    fetchBankData();
  }, [date]);

  const itemTypeWiseTotal = useMemo(() => {
    const totals = {};
    formDetails.forEach(({ Item_type, Size, Total_bottle = 0 }) => {
      if (!totals[Item_type]) {
        totals[Item_type] = {};
      }
      if (!totals[Item_type][Size]) {
        totals[Item_type][Size] = 0;
      }
      totals[Item_type][Size] += Total_bottle;
    });
    return totals;
  }, [formDetails]);

  const totalBeerQuantity = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Quantity = 0 }) =>
        Item_type === "Beer_sale" ? total + Quantity : total,
      0
    );
  }, [formDetails]);

  const totalIMFSQuantity = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Quantity = 0 }) =>
        Item_type === "IMFS_sale" ? total + Quantity : total,
      0
    );
  }, [formDetails]);

  const totalBeerbottle = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Total_bottle = 0 }) =>
        Item_type === "Beer_sale" ? total + Total_bottle : total,
      0
    );
  }, [formDetails]);

  const totalBeerprice = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Total_value = 0 }) =>
        Item_type === "Beer_sale" ? total + Total_value : total,
      0
    );
  }, [formDetails]);

  const totalIMFsbottle = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Total_bottle = 0 }) =>
        Item_type === "IMFS_sale" ? total + Total_bottle : total,
      0
    );
  }, [formDetails]);

  const totalIMFsprice = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Total_value = 0 }) =>
        Item_type === "IMFS_sale" ? total + Total_value : total,
      0
    );
  }, [formDetails]);

  const totalPos = useMemo(() => {
    return datas.reduce((total, { Pos = 0 }) => total + Pos, 0);
  }, [datas]);

  const totalCash = useMemo(() => {
    return datas.reduce((total, { Cash = 0 }) => total + Cash, 0);
  }, [datas]);

  const totalBank = useMemo(() => {
    return datas.reduce((total, { Bank = 0 }) => total + Bank, 0);
  }, [datas]);

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredData = data.filter((d) => d.Date.substring(0, 10) === date);
    setFormDetails(filteredData);
  };

  const totalClosingValue = useMemo(() => {
    return formDetails.reduce(
      (total, { Closing_value = 0 }) => total + Closing_value,
      0
    );
  }, [formDetails]);

  const imfsSale = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Sale_value = 0 }) =>
        Item_type === "IMFS_sale" ? total + Sale_value : total,
      0
    );
  }, [formDetails]);

  const beerSale = useMemo(() => {
    return formDetails.reduce(
      (total, { Item_type, Sale_value = 0 }) =>
        Item_type === "Beer_sale" ? total + Sale_value : total,
      0
    );
  }, [formDetails]);

  const totalOpeningValue = useMemo(() => {
    return formDetails.reduce(
      (total, { Opening_value = 0 }) => total + Opening_value,
      0
    );
  }, [formDetails]);

  const totalReceiptValue = useMemo(() => {
    return formDetails.reduce(
      (total, { Receipt_value = 0 }) => total + Receipt_value,
      0
    );
  }, [formDetails]);
  const totalSalesValue = useMemo(() => {
    return formDetails.reduce((total, { Sale_value = "0" }) => {
      const value = Number(Sale_value);
      return !isNaN(value) ? total + value : total;
    }, 0);
  }, [formDetails]);

  const totalValue = useMemo(() => {
    return formDetails.reduce(
      (total, { Total_value = 0 }) => total + Total_value,
      0
    );
  }, [formDetails]);

  const mapdata = [
    "Opening_bottle",
    "Receipt_bottle",
    "Total_bottle",
    "Sales_bottle",
    "Closing_bottle",
    "Sale_value",
    "Closing_value",
  ];

  return (
    <div id="wrapper">
      {/* <Dashboard /> */}

      <div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <div className="row">
          {mapdata.map((d) => (
            <div className="col" key={d}>
              <div className="card-body">
                <Sample valueType={d} formDetails={formDetails} />
              </div>
            </div>
          ))}
          <div className="col">
            <div className="card-body">
              <div className="sub-card">
                <table>
                  <thead>
                    <tr>
                      <th colSpan="5" style={{ fontWeight: "bold" }}>
                        Abstract
                      </th>
                    </tr>
                    <tr>
                      <th>Sum of opening value</th>
                      <th>Sum of rec</th>
                      <th>Sum of total value</th>
                      <th>Sum of Sale value</th>
                      <th>Sum of closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{totalOpeningValue}</td>
                      <td>{totalReceiptValue}</td>
                      <td>{totalValue}</td>
                      <td>{totalSalesValue}</td>
                      <td>{totalClosingValue}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th colSpan="6" style={{ fontWeight: "bold" }}>
                      Daily Sales Abstract
                    </th>
                  </tr>
                  <tr>
                    <th>Sum of IMFS sale value</th>
                    <th>Sum of Beer sale value</th>
                    <th>Total</th>
                    <th>Sum of Pos</th>
                    <th>Sum of NET Sale Cash</th>
                    <th>Sum of Bank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{imfsSale}</td>
                    <td>{beerSale}</td>
                    <td>{totalSalesValue}</td>
                    <td>{totalPos}</td>
                    <td>{totalCash}</td>
                    <td>{totalBank}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
