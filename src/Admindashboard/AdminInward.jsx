import React, { useEffect, useState, useMemo } from "react";
import Dashboard from "../dashboard/Dashboard";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./AdminDashboard";

function AdminInward({ Base_url }) {
  const [formDetails, setFormDetails] = useState([]);
  const [date, setDate] = useState("");
  const [invoice, setInvoice] = useState("");
  const [findItem, setFindItem] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editMRP, setEditMRP] = useState("");
  const [desciption, setDescription] = useState("");
  const [rangeEdit, setRangeEdit] = useState("");
  const [dummy, setDummy] = useState([]);
  const [invoicedata, setInvoiceData] = useState([]);
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [itemCode, setItemCode] = useState();

  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const headers = {
    headers: { authorization: token },
  };

  useEffect(() => {
    getInwardData();
  }, []);

  const getInwardData = async () => {
    try {
      const response = await axios.get(`${Base_url}/user/getInward`);
      setFormDetails(response.data);
      setDummy(response.data);
    } catch (error) {
      console.error("Error fetching inward data:", error);
      toast.error("Failed to fetch inward data");
    }
  };

  const handleSubmit = async (id) => {
    const data = {
      date,
      editMRP,
      itemCode,
      desciption,
      rangeEdit,
    };

    try {
      const response = await axios.patch(
        `${Base_url}/user/updateAllReceipt`,
        data
      );
      console.log(response.data);
      await getInwardData();
      toast.success("Successfully updated");
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Failed to update data");
    }

    setEditIndex(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterData();
  };

  const filterData = async () => {
    let filteredData = dummy;
    if (findItem && findItem !== "") {
      filteredData = dummy.filter(
        (d) => d.Product === findItem || d.Item_Code === findItem
      );
    }
    setFormDetails(filteredData);
  };

  const handleSearchByDate = async () => {
    try {
      const filteredData = formDetails.filter(
        (d) => d.Date.substring(0, 10) === date
      );
      const filteredInvoiceData = invoicedata.filter(
        (d) => d.Date.substring(0, 10) === date
      );

      setFormDetails(filteredData);
      setInvoiceData(filteredInvoiceData);
    } catch (error) {
      console.error("Error filtering data by date:", error);
    }
  };

  const handleInvoice = async () => {
    setIsAddingInvoice(true);

    try {
      const data = { formDetails, invoice };
      const response = await axios.post(`${Base_url}/user/invoice`, data);
      toast.success("Successfully submitted");
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast.error("Failed to add invoice");
    }

    setIsAddingInvoice(false);
  };

  const totalValue = useMemo(
    () =>
      formDetails.reduce(
        (total, item) => total + parseInt(item.Total_value),
        0
      ),
    [formDetails]
  );

  const OpeningValue = useMemo(
    () =>
      formDetails.reduce(
        (total, item) => total + parseInt(item.Opening_value),
        0
      ),
    [formDetails]
  );

  const ReceiptValue = useMemo(
    () => formDetails.reduce((total, item) => total + item.Receipt_value, 0),
    [formDetails]
  );

  const openingBottle = useMemo(
    () => formDetails.reduce((total, item) => total + item.Opening_bottle, 0),
    [formDetails]
  );

  const receiptBottle = useMemo(
    () => formDetails.reduce((total, item) => total + item.Receipt_bottle, 0),
    [formDetails]
  );

  const overallTotalBottle = useMemo(
    () =>
      formDetails.reduce(
        (total, detail) => total + (parseInt(detail.Total_bottle) || 0),
        0
      ),
    [formDetails]
    // AMSTEL PREMIUM STRONG BEER
  );
  const handleEdit = (id, invoice, mrp, itemCode, description, range) => {
    setEditIndex(id);
    setInvoice(invoice || 0);
    setEditMRP(mrp || 0);
    setItemCode(itemCode || 0);
    setDescription(description);
    setRangeEdit(range);
  };
  return (
    <div id="wrapper">
      <AdminDashboard />
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
                  You can search using proper Product name (e.g., Beer) or
                  item_code
                </th>
                <th colSpan={3}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <button onClick={handleSearchByDate}>Search</button>
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
            {formDetails.map((d, i) => (
              <tbody key={i}>
                <tr>
                  <td>
                    {editIndex === d._id ? (
                      <input
                        type="text"
                        value={rangeEdit}
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
                  <td>{d.Opening_bottle}</td>
                  <td>{d.Opening_value}</td>
                  <td>{d.Receipt_bottle}</td>
                  <td>
                    {editIndex === d._id ? (
                      <button onClick={() => handleSubmit(d._id)}>Save</button>
                    ) : (
                      <button
                        onClick={() =>
                          handleEdit(
                            d._id,
                            invoice,
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

export default AdminInward;
