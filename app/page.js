"use client";
import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ClientForm from "@/components/clientForm";
import MyModal from "@/components/Modals";

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day < 10 ? "0" + day : day}/${
    month < 10 ? "0" + month : month
  }/${year}`;
};
const Invoice = () => {
  const [invoice, setInvoice] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("A0001");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 15);
  const [invoiceDueDate, setInvoiceDueDate] = useState(endDate);
  const [businessName, setBusinessName] = useState("Tanbir & Co");
  const [businessAddress, setBusinessAddress] = useState("Kolkata");
  const [clientName, setClientName] = useState("Tanbir & Co");
  const [clientAddress, setClientAddress] = useState("Kolkata");
  const [clientEditButton, setClientEditButton] = useState(false);
  const [billedBy, setBilledBy] = useState("Billed By");
  const [billedTo, setBilledTo] = useState("Billed To");
  const [businessImage, setBusinessImage] = useState("");
  const [shippedFrom, setShippedFrom] = useState("Shipped From");
  const [shippedTo, setShippedTo] = useState("Shipped To");
  const [transportTitle, setTransportTitle] = useState("Transport Details");
  const [items, setItems] = useState([
    { itemName: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  const [total, setTotal] = useState(1);
  const [isShippingEnabled, setIsShippingEnabled] = useState(false);
  const [totalTitle, setTotalTitle] = useState("Total");

  const handleItemChange = useCallback((index, event) => {
    const values = [...items];
    values[index][event.target.name] = event.target.value;
    setItems(values);
  }, [items]);

  const calculateTotal = useCallback(() => {
    let newTotal = 0;
    items.forEach((item) => {
      newTotal += item.quantity * item.rate;
    });
    setTotal(newTotal);
    console.log(total)
  }, [items]);

  const addItem = useCallback(() => {
    const newItem = { itemName: '', quantity: 0, rate: 0, amount: 0 };
    newItem.amount = newItem.quantity * newItem.rate;
    setItems([...items, newItem]);
    calculateTotal();
  }, [calculateTotal,items]);

  const deleteItem = useCallback(() => {
    const newItems = [...items];
    newItems.pop();
    if (items.length === 1) {
      setItems([{ itemName: '', quantity: 0, rate: 0, amount: 0 }]);
    } else {
      setItems(newItems);
    }
    calculateTotal();
  }, [items]);

  const checkIfDataEntered = useCallback(() => {
    if (
      businessName !== '' &&
      businessAddress !== '' &&
      clientName !== '' &&
      clientAddress !== '' &&
      items.some((item) => item.itemName !== '' && item.quantity !== 0 && item.rate !== 0)
    ) {
      return true;
    }
    return false;
  }, [businessName, businessAddress, clientName, clientAddress, items]);

  const checkIfItemDataEntered = useCallback(() => {
    if (items.some((item) => item.itemName !== '' && item.quantity !== 0 && item.rate !== 0)) {
      return true;
    }
    return false;
  }, [items]);
  const toggleShipping = useCallback(() => {
    setIsShippingEnabled((prevIsShippingEnabled) => !prevIsShippingEnabled);
  }, []);

  const generatePDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF();
    doc.text(100, 20, invoice);
    const fomattedInvoiceDate = formatDate(invoiceDate);
    const fomattedInvoiceDueDate = formatDate(invoiceDueDate);
    doc.text(20, 30, "Invoice Number: " + invoiceNo);
    doc.text(20, 40, "Invoice Date: " + fomattedInvoiceDate);
    doc.text(20, 50, "Invoice Due Date: " + fomattedInvoiceDueDate);
    doc.text(20, 60, "Billed By");
    doc.text(20, 70, "Business Name: " + businessName);
    doc.text(20, 80, "Business Address: " + businessAddress);
    doc.addImage(businessImage, "JPEG", 150, 60, 30, 30);
    doc.text(20, 90, "Billed To");
    doc.text(20, 100, "Client Name: " + clientName);
    doc.text(20, 110, "Client Address: " + clientAddress);

    let startY = 120;
    let slNo = 1;
    doc.autoTable({
      startY,
      head: [["Sl No", "Product Name", "Quantity", "Price in $", "Total"]],
      body: items.slice(0, -1).map((product) => {
        // Excluding the last item
        const total = product.quantity * product.rate;
        const data = [
          slNo++,
          product.itemName,
          product.quantity,
          product.rate,
          total,
        ];
        return data;
      }),
    });

    const total = items.reduce(
      (acc, product) => acc + product.quantity * product.rate,
      0
    );
    doc.text(150, startY + items.length * 10 + 20, `Total: $${total}`);

    const pdfData = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfData);

    const newWindow = window.open();
    newWindow.document.write(
      '<iframe src="' + pdfUrl + '" width="100%" height="100%"></iframe>'
    );
  };
  return (
    <div className="flex flex-col py-3 m-5">
      <div className="flex items-center justify-center">
        <input
          className=" text-center p-2 w-20 border-dashed border-b-2 border-black "
          placeholder="Invoice"
          value={invoice}
          onChange={(e) => setInvoice(e.target.value)}
        />
      </div>
      <div className="grid lg:grid-cols-2 sm:grid-cols-1 sm:justify-items-center gap-4">
        <div className="m-4">
          <div className="flex items-center lg:justify-between sm:justify-start">
            <label className="p-4">Invoice No</label>
            <input
              className="text-center border-b-2 p-2"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <div className="flex items-center lg:justify-between sm:justify-start">
            <label className="p-4">Invoice Date</label>
            <DatePicker
              className="text-center border-b-2 p-2"
              showIcon
              selected={invoiceDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => {
                setInvoiceDate(date);
              }}
            />
          </div>
          <div className="flex items-center lg:justify-between sm:justify-start">
            <label className="p-4">Invoice Due Date</label>
            <DatePicker
              className="text-center border-b-2 p-2 "
              showIcon
              selected={invoiceDueDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => {
                setInvoiceDueDate(date);
              }}
            />
          </div>
        </div>
        <div className="flex justify-center items-center my-2">
          <input
            type="file"
            accept="image/*"
            className="text-center"
            onChange={(e) => {
              const file = e.target.files[0];
              const Reader = new FileReader();
              Reader.readAsDataURL(file);
              Reader.onload = () => {
                if (Reader.readyState === 2) {
                  setBusinessImage(Reader.result);
                }
              };
            }}
          />
          {businessImage ? (
            <div className="flex sm:flex-col sm:my-2 lg:flex-row">
              <img
                src={businessImage}
                alt="businessImage"
                className="w-100 h-40 p-4 m-2"
              />
              <button className="m-2" onClick={() => setBusinessImage("")}>
                x
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <div className="bg-slate-100 p-5">
          <div className="flex items-start">
            <input
              className="flex w-20 bg-inherit border-dashed border-b-2 border-black"
              value={billedBy}
              onChange={setBilledBy}
            />
            <p className="px-3">(Your Details)</p>
          </div>
          <div className="flex flex-col p-2">
            <div className="border-solid border-2 border-sky-800 p-2 my-2">
              <span className="px-4">{businessName}</span>
            </div>
            <div className="border-solid border-2 border-sky-800 p-5">
              <div className="flex items-center my-2">
                <label>Business Details</label>
                <button className="ml-auto">Edit</button>
              </div>
              <div className="my-2">
                <span>Business Name</span>
                <span className="px-5 ">{businessName}</span>
                <br />
                <span>Business Address</span>
                <span className="px-5 ">{businessAddress}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-100 p-5">
          <div className="flex">
            <input
              className="w-20 flex bg-inherit border-dashed border-b-2 border-black"
              value={billedTo}
              onChange={(e) => setBilledTo(e.target.value)}
            />
            <p>(Client Details)</p>
          </div>
          <div className="flex flex-col p-2">
            <div className="border-solid border-2 border-sky-800 p-2 my-2">
              <span className="px-4">{clientName}</span>
            </div>
            <div className="border-solid border-2 border-sky-800 p-5">
              <div className="flex items-center my-2">
                <label>Business Details</label>
                <button className="ml-auto"
                // onClick={setClientEditButton(true)}
                >Edit</button>
                {/* <ClientForm trigger={clientEditButton} setTrigger={setClientEditButton}/> */}
                
              </div>
              <div className="my-2">
                <span>Business Name</span>
                <span className="px-5 ">{clientName}</span>
                <br />
                <span>Business Address</span>
                <span className="px-5 ">{clientAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="m-5 flex items-center">
        <input
          className="w-5 h-5 hover:cursor-pointer"
          type="checkbox"
          value={isShippingEnabled}
          onChange={toggleShipping}
        />
        <label className="px-2 hover:cursor-pointer">
          Add Shipping Details
        </label>
        <br />
      </div>
      <div>
        {isShippingEnabled && (
          <div className="grid lg:grid-cols-2 gap-2 sm:grid-cols-1">
            <div className="bg-slate-200">
              <input
                className="bg-inherit m-4 border-dashed border-b-2 border-black"
                value={shippedFrom}
                onChange={(e) => setShippedFrom(e.target.value)}
              />
              <div className=" flex flex-col bg-white border border-black m-4 ">
                <div className="flex items-center m-4">
                  <input
                    className="w-5 h-5 hover:cursor-pointer"
                    type="checkbox"
                    // value={isShippingEnabled}
                    // onChange={toggleShipping}
                  />
                  <label className="px-2 hover:cursor-pointer">
                    Same as your business Address
                  </label>
                </div>
                <div className="flex flex-col m-3">
                  <input type="text" placeholder="Business / Freelance Name" />
                  <input type="text" placeholder="Country" />
                  <input type="text" placeholder="Address (optional)" />
                  <div className="flex ">
                    <input type="text" placeholder="City (optional)" />
                    <input type="text" placeholder="Postal Code / Zip Code" />
                  </div>
                  <input type="text" placeholder="State(Optional)" />
                </div>
              </div>
            </div>
            <div className="bg-slate-200">
              <input
                className="bg-inherit m-4 border-dashed border-b-2 border-black"
                value={shippedTo}
                onChange={(e) => setShippedTo(e.target.value)}
              />
              <div className="border border-black m-4">
                <p className="mx-4">Select a Shipping Address </p>
              </div>
              <div className=" flex flex-col bg-white border border-black m-4 ">
                <div className="flex items-center m-4">
                  <input
                    className="w-5 h-5 hover:cursor-pointer"
                    type="checkbox"
                    // value={isShippingEnabled}
                    // onChange={toggleShipping}
                  />
                  <label className="px-2 hover:cursor-pointer">
                    Same as your client&apos;s Address
                  </label>
                </div>
                <div className="flex flex-col m-3">
                  <input type="text" placeholder="Business / Freelance Name" />
                  <input type="text" placeholder="Country" />
                  <input type="text" placeholder="Address (optional)" />
                  <div className="flex ">
                    <input type="text" placeholder="City (optional)" />
                    <input type="text" placeholder="Postal Code / Zip Code" />
                  </div>
                  <input type="text" placeholder="State(Optional)" />
                </div>
              </div>
            </div>
            <div className="bg-slate-200">
              <input
                className="bg-inherit m-4 border-dashed border-b-2 border-black"
                value={transportTitle}
                onChange={(e) => setTransportTitle(e.target.value)}
              />
              <div className="flex flex-col bg-white border border-black m-4">
                <div className="flex m-4 items-center justify-between">
                  <div className="flex flex-col">
                    <label>Mode of Transport</label>
                    <select className="h-10" placeholder="Select">
                      <option>Road</option>
                      <option>Rail</option>
                      <option>Air</option>
                      <option>Ship</option>
                    </select>
                  </div>
                  <div className="flex flex-col ">
                    <label className="m-2">Transporter</label>
                    <input className="" placeholder="Select Transporter" />
                  </div>
                </div>
                <div className="m-4">
                  <label>Distance (in Km)</label>
                  <br />
                  <input type="text" placeholder="Distance" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-between md:flex-row lg:flex-row">
        <button className="w-20 bg-slate-100 border border-sky-950 m-5">
          Add Tax
        </button>
        <div>
          <label className="m-5 p-6">
            Currency<span className="text-red-800">*</span>
          </label>
          <select className="h-10 ">
            <option>US Dollar (USD)</option>
            <option>Indian Rupees (INR)</option>
            <option>Saudi Arabian Riyal (SAR)</option>
          </select>
        </div>
        <button className="m-5 bg-slate-100 border border-black p-2">
          Number/Currency Format
        </button>
      </div>
      <div className="flex justify-center overflow-x-auto m-5 p-5">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="itemName"
                    placeholder="Item Name (Required) "
                    className="text-center lg:text-right"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    className="text-center lg:text-right"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="rate"
                    className="text-center lg:text-right"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="amount"
                    className="text-center lg:text-right"
                    value={item.quantity * item.rate}
                    readOnly
                  />
                </td>
                <td></td>
                <td>
                  {index === items.length - 1 ? null : (
                    <button onClick={deleteItem} className="text-xl">
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row lg:flex-row m-3 justify-center">
        <button
          onClick={addItem}
          disabled={!checkIfItemDataEntered()}
          className=" text-center text-xl px-20 m-5 border-dashed border-2 border-slate-500 w-100"
        >
          <span className="text-3xl">Add New Line</span>
        </button>
        <button className=" text-center text-xl px-20 m-5 border-dashed border-2 border-slate-500 w-auto">
          <span className="text-3xl"> Add New Group</span>
        </button>
      </div>
      <div className="flex justify-end m-6">
        <div className="flex flex-col">
          <label>Discounts</label>
          <br />
          <hr className="w-auto h-3" />
          <div className="flex items-center">
            <input
              className="w-12 text-xl m-1 border-dashed border-b-2 border-black"
              value={totalTitle}
              onChange={(e) => setTotalTitle(e.target.value)}
            />
            <span>(USD)</span>
            <h3 className="mx-4">
              ${total}
            </h3>
          </div>
          <hr className="w-auto h-3" />
        </div>
      </div>
      <button
        onClick={generatePDF}
        disabled={!checkIfDataEntered()}
        className="text-centre bg-blue-500 border-collapse rounded p-2 m-5"
      >
        Generate
      </button>
    </div>
  );
};

export default Invoice;
