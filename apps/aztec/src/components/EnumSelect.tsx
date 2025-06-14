import React from "react";

interface EnumSelectProps<T extends Record<string, string>> {
  label: string;
  enumObject: T;
  register: any;
  name: string;
  errors?: any;
  defaultValue?: string;
}

const customLabels: Record<string, Record<string, string>> = {
  Distributor: {
    A: "ARG",
    M: "MASON",
    S: "STG",
    O: "OTHER",
    B: "SAM (benson)",
    W: "SEAN (winaris)",
    C: "CANAM",
  },
};

const EnumSelect = <T extends Record<string, string>>({
  label,
  enumObject,
  register,
  name,
  errors,
  defaultValue,
}: EnumSelectProps<T>) => {
  const options = Object.values(enumObject);
  const showDefaultOption =
    name === "paymentType" || name === "invoiceType" || name === "distributor";
  return (
    <div
      className={`flex flex-col gap-2 w-full md:w-1/4 ${label === "Form Status" ? "mt-auto" : ""}`}
    >
      <label className="text-xs text-gray-400">{label}</label>
      <select
        className="border-b-2 p-2 rounded-md text-xs w-full bg-aztecBlack-dark cursor-pointer"
        {...register(name)}
        defaultValue={defaultValue}
      >
        {showDefaultOption && !defaultValue && (
          <option value="">-- Select --</option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {customLabels[label]?.[option] ?? option}
          </option>
        ))}
      </select>
      {errors?.[name]?.message && (
        <p className="text-xs text-red-400">
          {errors[name].message.toString()}
        </p>
      )}
    </div>
  );
};

export default EnumSelect;
