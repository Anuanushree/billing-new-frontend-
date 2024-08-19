import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "../dashboard/Dashboard";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import AdminDashboard from "../Admindashboard/AdminDashboard";
import Cookies from "cookies-js";

function ExcelForm({ Base_url }) {
  const initialState = {
    Range: "",
    Product: null,
    Description: "",
    Item_Code: null,
    Size: null,
    MRP_Value: null,
    Case_Quantity: null,
    Opening_bottle: null,
    Receipt_bottle: null,
    Item_type: null,
  };
  const [formDetails, setFormDetails] = useState([]);
  const [data, setData] = useState(initialState);
  const [date, setdate] = useState("");

  const navigate = useNavigate();

  const id = Cookies.get("id");
  const token = Cookies.get("token");

  const headers = {
    headers: { authorization: `${token}` },
  };

  const hanldeData = async (e) => {
    setData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  useEffect(() => {
    const get = async () => {
      try {
        const response = await axios.get(`${Base_url}/user/getData`, headers);
        setFormDetails(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/"); // Replace '/login' with the path to your login page
        } else {
          // Handle other errors

          console.error("Error fetching data:", error);
        }
      }
    };
    get();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        date: date,
        Range: data.Range,
        Product: data.Product,
        Description: data.Description,
        Item_Code: data.Item_Code,
        Size: data.Size,
        MRP_Value: data.MRP_Value,
        Case_Quantity: data.Case_Quantity,
        Opening_bottle: data.Opening_bottle,
        Item_type: data.Item_type,
        Case: 0,
        Loose: 0,
        Receipt_bottle: data.Receipt_bottle,
      };
      console.log(formData);
      const response = await axios.post(
        `${Base_url}/user/create`,
        {
          formData,
        },
        headers
      );
      console.log(response.data);
      toast.success("successfully added data in item master");
      // setData(initialState);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/"); // Replace '/login' with the path to your login page
      } else {
        // Handle other errors

        toast.warning("Something wrong when added data");
        console.error("Error fetching data:", error);
      }
    }
  };
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState("");

  // const handleConvert = () => {
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const data = e.target.result;
  //       const workbook = XLSX.read(data, { type: "binary" });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       // const json = XLSX.utils.sheet_to_json(worksheet);
  //       const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

  //       const jsonDataString = JSON.stringify(json, null, 2);

  //       setJsonData(jsonDataString); // Update the state with the JSON data

  //       // Move the data processing logic here
  //       const getdata = async () => {
  //         const parsedJsonData = JSON.parse(jsonDataString);

  //         for (const formData of parsedJsonData) {
  //           try {
  //             formData.Size = parseInt(formData.Size); // Ensure Size is parsed as an integer

  //             formData.Receipt_bottle = parseInt(formData.Receipt_bottle);
  //             formData.Opening_bottle = parseInt(formData.Opening_bottle);
  //             console.log(formData);
  //             const response = await axios.post(
  //               `${Base_url}/user/create`,
  //               formData,
  //               headers
  //             );
  //             console.log(response.data);
  //             // console.log(itemData);
  //           } catch (error) {
  //             console.log("Error in ExcelForm : ", error);
  //             toast.warning("Something went wrong when adding data");
  //           }
  //         }

  //         // Optionally, you can clear the JSON data state after processing
  //         setJsonData("");
  //       };
  //       getdata();
  //     };
  //     reader.readAsBinaryString(file);
  //   }
  // };

  const handleConvert = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // Ensure raw: false to convert to appropriate types

        // Logging to check if all columns are read correctly
        console.log(json);

        const getdata = async () => {
          for (const formData of json) {
            try {
              formData.Size = parseInt(formData.Size); // Ensure Size is parsed as an integer
              formData.Receipt_bottle = parseInt(formData.Receipt_bottle); // Parse Receipt_bottle as an integer
              formData.Opening_bottle = parseInt(formData.Opening_bottle); // Parse Opening_bottle as an integer

              // Other fields parsing as needed...

              console.log(formData);
              const response = await axios.post(
                `${Base_url}/user/create`,
                formData,
                headers
              );
              console.log(response.data);
            } catch (error) {
              if (error.response && error.response.status === 401) {
                navigate("/"); // Replace '/login' with the path to your login page
              } else {
                // Handle other errors

                toast.warning("Something wrong when added data");
                console.error("Error fetching data:", error);
              }
            }
          }

          // Optionally, you can clear the JSON data state after processing
          setJsonData("");
        };

        await getdata(); // Call the async function to process data
      };

      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="m-2">
      <ToastContainer />

      <div className="container-fluid form-container">
        {/* <div>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleConvert}>Convert</button>
        </div> */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Range</label>
            <select
              className="form-control"
              name="Range"
              onChange={hanldeData}
              required
            >
              <option value="">Select Range</option>
              <option value={"Beer"}>Beer</option>
              <option value={"Premium"}>Premium</option>
              <option value={"Medium"}>Medium</option>
              <option value={"Ordinary"}>Ordinary</option>
            </select>
          </div>
          <div className="form-group">
            <label>Product</label>
            <select
              className="form-control"
              name="Product"
              onChange={hanldeData}
              required
            >
              <option value="">Select Product</option>
              <option value={"Beer"}>Beer</option>
              <option value={"Whisky"}>Whisky</option>
              <option value={"Brandy"}>Brandy</option>
              <option value={"vodka"}>vodka</option>
              <option value={"Rum"}>Rum </option>
              <option value={"GIN"}>GIN</option>
              <option value={"Wine"}>Wine</option>
            </select>
          </div>
          <div className="form-group">
            <label>Brand name</label>
            <input
              type="text"
              name="Description"
              value={data.Description}
              onChange={hanldeData}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Item code</label>
            <input
              type="text"
              name="Item_Code"
              value={data.Item_Code}
              onChange={hanldeData}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Size</label>
            <select
              className="form-control"
              name="Size"
              onChange={hanldeData}
              required
            >
              <option value="">Select Size</option>
              <option value={180}>180</option>
              <option value={375}>375</option>
              <option value={325}>325</option>
              <option value={500}>500</option>
              <option value={650}>650</option>
              <option value={750}>750</option>
              <option value={1000}>1000</option>
            </select>
          </div>
          <div className="form-group">
            <label>MRP value</label>
            <input
              type="Number"
              name="MRP_Value"
              value={data.MRP_Value}
              onChange={hanldeData}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Opening Bottle</label>
            <input
              type="Number"
              name="Opening_bottle"
              value={data.Opening_bottle}
              onChange={hanldeData}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Receipt Bottle</label>
            <input
              type="Number"
              name="Receipt_bottle"
              value={data.Receipt_bottle}
              onChange={hanldeData}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Item type</label>
            <select
              className="form-control"
              name="Item_type"
              onChange={hanldeData}
              required
            >
              <option value="">Select Item Type</option>
              <option value={"IMFS_sale"}>IMFS_sale</option>
              <option value={"Beer_sale"}>Beer_sale</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-default form-control bg-primary mt-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExcelForm;
