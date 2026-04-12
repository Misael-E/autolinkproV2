"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, EnumSelect } from "@repo/ui";
import { revenueSchema, RevenueSchema, InvoiceEnum } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { updateRevenue } from "@/lib/actions/revenue";

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
    setValue,
    formState: { errors },
  } = useForm<RevenueSchema>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      costBeforeGst: data?.costBeforeGst ?? 0,
      materialCost: data?.materialCost ?? 0,
      gasCost: data?.gasCost ?? 0,
      shopFees: data?.shopFees ?? 0,
      distributor: data?.service?.distributor ?? "",
    },
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
    if (state.error) {
      toast.error("Something went wrong. Please try again.");
    }
  }, [state, router, type]);

  // Pre-fill glass cost from pricing bank if not already set on the revenue record
  useEffect(() => {
    if (data?.costBeforeGst) return;
    const code = data?.service?.code;
    const supplier = data?.service?.distributor;
    const customerType = data?.service?.invoice?.customer?.customerType;
    const location = data?.service?.invoice?.location?.slug ?? data?.locationSlug;
    if (!code || !supplier || !customerType) return;

    const params = new URLSearchParams({ code, supplier, customerType });
    if (location) params.set("location", location);
    fetch(`/api/pricing-bank?${params.toString()}`)
      .then((res) => res.json())
      .then((pricing) => {
        if (pricing?.glassCost) {
          setValue("costBeforeGst", pricing.glassCost);
        }
      })
      .catch(() => {});
  }, []);

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      id: id as number,
      serviceId: data.serviceId as number,
      grossSales: data.grossSales,
      grossSalesGst: data.grossSalesGst,
    });
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-white">
        {type === "create" ? "Create New Revenue" : "Update Revenue"}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Revenue Information</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
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
        <InputField
          label="Gas Cost"
          name="gasCost"
          defaultValue={data?.gasCost}
          register={register}
          error={errors.gasCost}
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
      <button className="bg-aztecBlue text-white py-2.5 px-4 rounded-md w-full font-medium hover:opacity-90 transition-opacity">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default RevenueForm;
