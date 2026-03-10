"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { employeeSchema, EmployeeSchema } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { createEmployee, updateEmployee } from "@/lib/actions/employee";
import EnumSelect from "../EnumSelect";
import { RoleEnum } from "@/lib/types";

const EmployeeForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeSchema>({
    resolver: zodResolver(employeeSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createEmployee : updateEmployee,
    {
      success: false,
      message: "",
    }
  );

  useEffect(() => {
    if (state.success) {
      // toast(`Employee has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }

    if (state.message) {
      toast(`${state.message}`);
    }
  }, [state, router, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  return (
    <form className="flex flex-col gap-6 text-white" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Employee" : "Update Employee"}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Authentication Information</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Personal Information</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors.firstName}
        />
        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors.lastName}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <EnumSelect
          label="Role"
          enumObject={RoleEnum}
          register={register}
          name="role"
          errors={errors}
          defaultValue={data?.role}
        />
      </div>
      <button className="bg-odetailBlue text-white py-2.5 px-4 rounded-md w-full font-medium hover:opacity-90 transition-opacity">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EmployeeForm;
