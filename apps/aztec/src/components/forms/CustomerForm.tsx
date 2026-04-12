"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, EnumSelect } from "@repo/ui";
import { customerSchema, CustomerSchema, CustomerTypeEnum } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { createCustomer, updateCustomer } from "@/lib/actions/customer";
import { toast } from "react-toastify";

const CustomerForm = ({
  type,
  data,
  id,
  setOpen,
  locationSlug,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id?: number | string;
  locationSlug?: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createCustomer : updateCustomer,
    {
      success: false,
      error: false,
    },
  );

  useEffect(() => {
    if (state.success) {
      toast(`Customer has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, id: id as string, locationSlug: locationSlug });
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-white">
        {type === "create" ? "Create New Customer" : "Update Customer"}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Personal Information</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
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
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Street Address 1"
          name="streetAddress1"
          defaultValue={data?.streetAddress1}
          register={register}
          error={errors.streetAddress1}
        />
        <InputField
          label="Street Address 2"
          name="streetAddress2"
          defaultValue={data?.streetAddress2}
          register={register}
          error={errors.streetAddress2}
        />
        <InputField
          label="Postal Code"
          name="postalCode"
          defaultValue={data?.postalCode}
          register={register}
          error={errors.postalCode}
        />
        <InputField
          label="Company Name"
          name="companyName"
          defaultValue={data?.companyName}
          register={register}
          error={errors.companyName}
        />
        <EnumSelect
          label="Customer Type"
          enumObject={CustomerTypeEnum}
          register={register}
          name="customerType"
          errors={errors}
          defaultValue={data?.customerType}
        />
        <InputField
          label="Warranty"
          name="subscriptionWarranty"
          defaultValue={data?.subscription}
          register={register}
          error={errors.subscriptionWarranty}
          type="checkbox"
        />
        <InputField
          label="Notes"
          name="notes"
          type="textarea"
          defaultValue={data?.notes}
          register={register}
          error={errors.notes}
        />
      </div>
      <button className="bg-aztecBlue text-white py-2.5 px-4 rounded-md w-full font-medium hover:opacity-90 transition-opacity">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default CustomerForm;
