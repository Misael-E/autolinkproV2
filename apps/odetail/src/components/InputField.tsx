import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  inputProps,
}: InputFieldProps) => {
  const isCheckbox = type === "checkbox";
  return (
    <div
      className={`flex ${isCheckbox ? "flex-row items-center gap-2" : "flex-col gap-2"} w-full md:w-1/4`}
    >
      <label className={`${isCheckbox ? "text-sm" : "text-xs"} text-gray-400`}>
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          {...register(name)}
          defaultValue={defaultValue}
          className="border-b-2 p-2 rounded-md text-sm w-full bg-odetailBlack-dark h-10 lg:h-24 resize-none"
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          defaultValue={
            name === "email" ? defaultValue || "na@na.com" : defaultValue
          }
          className={`${
            isCheckbox
              ? "w-4 h-4 cursor-pointer checked:bg-odetailBlue checked:border-odetailBlue"
              : "ring-0 border-b-2 p-2 rounded-md text-sm w-full bg-odetailBlack-dark"
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
