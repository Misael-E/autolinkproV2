"use client";

import { useState } from "react";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CustomerStatementButtonProps {
  customerId: string;
}

export default function CustomerStatementButton({
  customerId,
}: CustomerStatementButtonProps) {
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;

  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(today);
  const [open, setOpen] = useState(false);

  const handleGenerate = () => {
    const url = `/list/customers/${customerId}/pdf?startDate=${startDate}&endDate=${endDate}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-3 rounded-md bg-odetailBlue text-white text-xs flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faFileInvoice} className="w-4" />
        Combined Statement
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 bg-odetailBlack-dark border border-gray-700 rounded-md p-4 shadow-lg w-72">
          <h2 className="text-white text-sm font-semibold mb-3">
            Generate Invoice Statement
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-xs">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-odetailBlack-light text-white text-sm rounded px-2 py-1 border border-gray-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-xs">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-odetailBlack-light text-white text-sm rounded px-2 py-1 border border-gray-600"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleGenerate}
                className="flex-1 bg-odetailBlue text-white text-xs rounded py-2"
              >
                Generate PDF
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-gray-700 text-white text-xs rounded py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
