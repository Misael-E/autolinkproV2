import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, FieldError } from "react-hook-form";

type DatePickerFieldProps = {
  label: string;
  name: string;
  control: any;
  defaultValue?: Date | null;
  error?: FieldError;
};

const DatePickerField = ({
  label,
  name,
  control,
  defaultValue,
  error,
}: DatePickerFieldProps) => {
  let showTime = true;
  let dateFormat = "Pp";

  if (
    name === "date" ||
    name === "startDate" ||
    name === "endDate" ||
    name === "paymentDate"
  ) {
    showTime = false;
    dateFormat = "MMMM d, yyyy";
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue ? new Date(defaultValue).toISOString() : ""}
        render={({ field }) => (
          <DatePicker
            name={name}
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => {
              field.onChange(date ? date.toISOString() : "");
            }}
            className="border border-gray-700 px-3 py-2.5 rounded-lg text-sm w-full bg-[#252525] text-white placeholder-gray-500 focus:outline-none focus:border-odetailBlue focus:ring-1 focus:ring-odetailBlue/20 transition-all"
            wrapperClassName="w-full"
            showTimeSelect={showTime}
            dateFormat={dateFormat}
            timeIntervals={30}
            placeholderText={`Select ${label}`}
            minTime={new Date(2025, 1, 0, 9, 0, 0)}
            maxTime={new Date(2025, 1, 0, 22, 0, 0)}
          />
        )}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default DatePickerField;
