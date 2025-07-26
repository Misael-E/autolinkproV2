"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangeForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStart = searchParams.get("start");
  const initialEnd = searchParams.get("end");

  const [startDate, setStartDate] = useState<Date | null>(
    initialStart ? new Date(initialStart) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialEnd ? new Date(initialEnd) : null
  );

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (startDate) params.set("start", startDate.toISOString());
    if (endDate) params.set("end", endDate.toISOString());
    params.set("dateRange", "custom");
    router.push(`/list/billing?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 items-end font-normal">
      <div className="flex flex-col text-white text-sm">
        <label>Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          maxDate={endDate || undefined}
          placeholderText="Select start date"
          className="rounded px-2 py-1 text-black"
        />
      </div>
      <div className="flex flex-col text-white text-sm">
        <label>End Date</label>
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          minDate={startDate || undefined}
          placeholderText="Select end date"
          className="rounded px-2 py-1 text-black"
        />
      </div>
      <button
        onClick={applyFilter}
        className="px-3 py-2 bg-aztecBlue text-white rounded text-sm font-semibold"
      >
        Apply
      </button>
    </div>
  );
};

export default DateRangeForm;
