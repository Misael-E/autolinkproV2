"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { revenueSchema, RevenueSchema, InvoiceEnum } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { updateRevenue } from "@/lib/actions/revenue";
import EnumSelect from "../EnumSelect";

const RevenueForm = ({
  type,
  data,
  id,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id?: number | string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RevenueSchema>({
    resolver: zodResolver(revenueSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(updateRevenue, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      toast(`Revenue has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      id: id as number,
      serviceId: data.serviceId as number,
      gasCost: data.gasCost,
      grossSales: data.grossSales,
      grossSalesGst: data.grossSalesGst,
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-white">
        {type === "create" ? "Create New Revenue" : "Update Revenue"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Revenue Information
      </span>
      <div className="flex justify-between flex-wrap gap-4 text-white">
        <InputField
          label="Glass Cost"
          name="costBeforeGst"
          defaultValue={data?.costBeforeGst}
          register={register}
          error={errors.costBeforeGst}
        />
        <InputField
          label="Material Cost"
          name="materialCost"
          defaultValue={data?.materialCost}
          register={register}
          error={errors.materialCost}
        />
        <EnumSelect
          label="Distributor"
          enumObject={InvoiceEnum}
          register={register}
          name="distributor"
          errors={errors}
          defaultValue={data?.service?.distributor}
        />
        <InputField
          label="Shop Fees"
          name="shopFees"
          defaultValue={data?.shopFees}
          register={register}
          error={errors?.shopFees}
        />
      </div>
      <button className="bg-aztecBlue text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default RevenueForm;
