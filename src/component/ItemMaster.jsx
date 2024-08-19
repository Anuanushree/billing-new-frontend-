import React, { useEffect, useState, useMemo } from "react";
import Dashboard from "../dashboard/Dashboard";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "cookies-js";

function ItemMaster({ Base_url }) {
  const [formDetails, setFormDetails] = useState([]);
  const [date, setDate] = useState("");
  const [invoice, setInvoice] = useState();
  const [array, setArray] = useState([]);
  const [desciption, setDescription] = useState();
  const [editIndex, setEditIndex] = useState(null);
  const [editedCaseValue, setEditedCaseValue] = useState(0);
  const [editMRP, setEditMRP] = useState();
  const [itemCode, setItemCode] = useState();
  const [findItem, setFindItem] = useState();
  const [editedLooseValue, setEditedLooseValue] = useState(0);
  const [ReceiptBottle, setReceiptBottle] = useState();
  const [OpeningBottle, setOpeningBottle] = useState();
  const [dummy, setDummy] = useState([]);
  const [invoicedata, setinvoiceData] = useState([]);
  const [isAddingInvoice, setIsAddingInvoice] = useState(false); // State to track adding invoice loading state
  const [ranageEdit, setRangeEdit] = useState();

  const handleEdit = (
    id,
    invoice,
    receiptbottle,
    openingBottle,
    mrp,
    itemCode,
    description,
    range
  ) => {
    setEditIndex(id);
    setInvoice(invoice || 0);
    setReceiptBottle(receiptbottle);
    setOpeningBottle(openingBottle);
    setEditMRP(mrp);
    setItemCode(itemCode);
    setDescription(description);
    setRangeEdit(range);
  };

  const id = Cookies.get("id");
  const token = Cookies.get("token");

  const headers = {
    headers: { authorization: `${token}` },
  };

  useEffect(() => {
    filterdata();
  }, [findItem, array]);

  const get = async () => {
    try {
      const response = await axios.get(`${Base_url}/user/getData`, headers);
      setFormDetails(response.data);
      setDummy(response.data);
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
    get();
  }, []);

  useEffect(() => {
    const getinvoice = async () => {
      const response = await axios.get(`${Base_url}/user/getinvoice`, headers);
      setinvoiceData(response.data);
    };
    getinvoice();
  }, []);

  const handleSubmit = async (id) => {
    const data = {
      date,
      invoice,
      editedCaseValue,
      editedLooseValue,
      ReceiptBottle: ReceiptBottle || 0,
      OpeningBottle: OpeningBottle || 0,
      id,
      editIndex,
      formDetails,
      editMRP,
      itemCode,
      desciption,
      ranageEdit,
    };

    try {
      const response = await axios.put(
        `${Base_url}/user/updateReceipt`,
        data,
        headers
      );

      const get1 = async () => {
        const response = await axios.get(`${Base_url}/user/getdata`, headers);
        setDummy(response.data);
        setArray(response.data);
      };
      await get1();
      filterdata();
      toast.success("Successfully updated");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/"); // Replace '/login' with the path to your login page
      } else {
        // Handle other errors
        console.error("Error fetching data:", error);
      }
    }

    setEditIndex(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterdata();
  };

  const filterdata = async () => {
    let a = dummy;

    // Convert search term to lowercase for case-insensitive comparison
    const searchTermLower = findItem ? findItem.toLowerCase() : "";

    // Filter data based on search term
    const filt = searchTermLower
      ? a.filter((d) => {
          const productMatch = d.Product
            ? d.Product.toLowerCase().includes(searchTermLower)
            : false;
          const RangeMatch = d.Product
            ? d.Range.toLowerCase().includes(searchTermLower)
            : false;
          const itemCodeMatch = d.Item_Code
            ? d.Item_Code.toString().includes(searchTermLower)
            : false;
          const mrpMatch = d.MRP_Value
            ? d.MRP_Value.toString().includes(searchTermLower)
            : false;
          return productMatch || itemCodeMatch || mrpMatch || RangeMatch;
        })
      : a;

    setFormDetails(filt);
  };

  const handleSearch1 = async () => {
    const filt = array.filter((d) => d.Date.substring(0, 10) === date);
    const filt1 = invoicedata.filter((d) => d.Date.substring(0, 10) === date);

    setFormDetails(filt);
    setinvoiceData(filt1);
  };

  const totalValue = formDetails.reduce(
    (total, item) => total + parseInt(item.Total_value),
    0
  );
  const OpeningValue = formDetails.reduce(
    (total, item) => total + parseInt(item.Opening_value),
    0
  );
  const ReceiptValue = formDetails.reduce(
    (total, item) => total + item.Receipt_value,
    0
  );
  const openingBottle = formDetails.reduce(
    (total, item) => total + item.Opening_bottle,
    0
  );
  const receiptBottle = formDetails.reduce(
    (total, item) => total + item.Receipt_bottle,
    0
  );

  const overallTotalBottle = useMemo(
    () =>
      formDetails.reduce(
        (total, detail) => total + (parseInt(detail.Total_bottle) || 0),
        0
      ),
    [formDetails]
  );

  const handleInvoice = async () => {
    setIsAddingInvoice(true); // Start adding invoice loading indicator

    try {
      const data = { formDetails, invoice };
      const response = await axios.post(
        `${Base_url}/user/invoice`,
        data,
        headers
      );
      toast.success("Successfully submitted");
    } catch (error) {
      console.log("error:", error);
    }

    setIsAddingInvoice(false); // Stop adding invoice loading indicator
  };

  return (
    <div className="m-2">
      {/* <Dashboard /> */}
      <ToastContainer />
      <div className="table-container">
        <div className="table-body-container">
          {isAddingInvoice && (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <p>Adding invoice...</p>
            </div>
          )}
          <table className="table table-dark table-bordered border border-primary p-2 m-4">
            <thead className="table-primary">
              <tr>
                <th colSpan={3}>
                  <input
                    type="text"
                    value={findItem}
                    onChange={(e) => setFindItem(e.target.value)}
                  />
                  <button onClick={handleSearch}>Search</button>
                </th>
                <th colSpan={6}>
                  {" "}
                  You can search using proper Product name (e.g., Beer) or
                  item_code
                </th>
                <th colSpan={3}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <button onClick={handleSearch1}>Search</button>
                </th>
                <th>
                  <input
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                  />{" "}
                  <button onClick={handleInvoice}>Add invoice</button>
                </th>
              </tr>
            </thead>
            <thead className="table-secondary border-danger">
              <tr>
                <th>Range</th>
                <th>Product</th>
                <th>Brand name</th>
                <th>Item code</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>MRP</th>
                <th>Opening Bottle</th>
                <th>Opening value</th>
                <th>Receipt Bottle</th>
                <th></th>
                <th>Receipt value</th>
                <th>Total value</th>
                <th>Total Bottle</th>
                <th>Invoice number</th>
              </tr>
            </thead>
            {formDetails
              .sort((a, b) => {
                const productComparison = a.Product.localeCompare(b.Product);
                return productComparison !== 0
                  ? productComparison
                  : a.Description.localeCompare(b.Description);
              })
              .map((d, i) => (
                <tbody key={i}>
                  <tr>
                    <td>
                      {editIndex === d._id ? (
                        <input
                          type="text"
                          value={ranageEdit}
                          style={{
                            width: "60px",
                            padding: "5px",
                            fontSize: "12px",
                          }}
                          onChange={(e) => setRangeEdit(e.target.value)}
                        />
                      ) : (
                        d.Range
                      )}
                    </td>
                    <td>{d.Product}</td>
                    <td>
                      {editIndex === d._id ? (
                        <input
                          type="text"
                          value={desciption}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      ) : (
                        d.Description
                      )}
                    </td>
                    <td>{d.Item_Code}</td>
                    <td>{d.Size}</td>
                    <td>{d.Quantity}</td>
                    <td>
                      {editIndex === d._id ? (
                        <input
                          type="Number"
                          value={editMRP}
                          style={{
                            width: "60px",
                            padding: "5px",
                            fontSize: "12px",
                          }}
                          onChange={(e) => setEditMRP(e.target.value)}
                        />
                      ) : (
                        d.MRP_Value
                      )}
                    </td>
                    <td>
                      {editIndex === d._id ? (
                        <input
                          type="Number"
                          value={OpeningBottle}
                          style={{
                            width: "60px",
                            padding: "5px",
                            fontSize: "12px",
                          }}
                          onChange={(e) => setOpeningBottle(e.target.value)}
                        />
                      ) : (
                        d.Opening_bottle
                      )}
                    </td>
                    <td>{d.Opening_value}</td>
                    <td>
                      {editIndex === d._id ? (
                        <input
                          type="Number"
                          value={ReceiptBottle}
                          style={{
                            width: "60px",
                            padding: "5px",
                            fontSize: "12px",
                          }}
                          onChange={(e) => setReceiptBottle(e.target.value)}
                        />
                      ) : (
                        d.Receipt_bottle
                      )}
                    </td>
                    <td>
                      {editIndex === d._id ? (
                        <button onClick={() => handleSubmit(d._id)}>
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleEdit(
                              d._id,
                              invoice,
                              d.Receipt_bottle,
                              d.Opening_bottle,
                              d.MRP_Value,
                              d.Item_Code,
                              d.Description,
                              d.Range
                            )
                          }
                        >
                          Edit
                        </button>
                      )}
                    </td>
                    <td>{d.Receipt_value}</td>
                    <td>{d.Total_value}</td>
                    <td>{d.Total_bottle}</td>
                    <td>
                      {editIndex === d._id ? (
                        <input
                          type="text"
                          value={invoice}
                          onChange={(e) => setInvoice(e.target.value)}
                        />
                      ) : (
                        d.invoice
                      )}
                    </td>
                  </tr>
                </tbody>
              ))}
            <tfoot>
              <tr>
                <td colSpan={7}>Total</td>
                <td>{openingBottle > 0 ? openingBottle : 0}</td>
                <td>{OpeningValue > 0 ? OpeningValue : 0}</td>
                <td>{receiptBottle > 0 ? receiptBottle : 0}</td>
                <td></td>
                <td>{ReceiptValue > 0 ? ReceiptValue : 0}</td>
                <td>{totalValue > 0 ? totalValue : 0}</td>
                <td>{overallTotalBottle > 0 ? overallTotalBottle : 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ItemMaster;
