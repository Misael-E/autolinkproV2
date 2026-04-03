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
		name === "paymentType" ||
		name === "invoiceType" ||
		name === "distributor" ||
		name === "quadrant";
  return (
    <div
      className={`flex flex-col gap-2 w-full ${label === "Form Status" ? "mt-auto" : ""}`}
    >
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <select
        className="border border-gray-700 px-3 py-2.5 rounded-lg text-sm w-full bg-[#252525] text-white cursor-pointer focus:outline-none focus:border-odetailBlue focus:ring-1 focus:ring-odetailBlue/20 transition-all"
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
