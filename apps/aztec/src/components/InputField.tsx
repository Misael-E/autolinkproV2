import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string | number;
  value?: string | number;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  value,
  error,
  inputProps,
}: InputFieldProps) => {
  const isCheckbox = type === "checkbox";
  return (
    <div
      className={`flex ${isCheckbox ? "flex-row items-center gap-2" : "flex-col gap-2"} w-full`}
    >
      <label className={`${isCheckbox ? "text-sm" : "text-xs"} text-gray-400 font-medium`}>
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          {...register(name)}
          defaultValue={defaultValue}
          className="border border-gray-700 px-3 py-2.5 rounded-lg text-sm w-full bg-[#252525] text-white placeholder-gray-500 focus:outline-none focus:border-aztecBlue focus:ring-1 focus:ring-aztecBlue/20 transition-all h-10 lg:h-24 resize-none"
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          {...(value !== undefined ? { value } : { defaultValue })}
          className={`${
            isCheckbox
              ? "w-4 h-4 cursor-pointer accent-aztecBlue"
              : "border border-gray-700 px-3 py-2.5 rounded-lg text-sm w-full bg-[#252525] text-white placeholder-gray-500 focus:outline-none focus:border-aztecBlue focus:ring-1 focus:ring-aztecBlue/20 transition-all"
          }`}
          {...inputProps}
        />
      )}

      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
