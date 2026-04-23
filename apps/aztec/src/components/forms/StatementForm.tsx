"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InvoiceEnum, statementSchema, StatementSchema } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { DatePickerField, EnumSelect } from "@repo/ui";
import moment from "moment";
import { createStatement, updateStatement } from "@/lib/actions/statement";

const StatementForm = ({
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
    control,
    formState: { errors },
  } = useForm<StatementSchema>({
    resolver: zodResolver(statementSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createStatement : updateStatement,
    {
      success: false,
      error: false,
    }
  );

  useEffect(() => {
    if (state.success) {
      toast(`Statement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      id: id as number,
      locationSlug: locationSlug,
    });
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-white">
        {type === "create" ? "Create New Statement" : "Update Statement"}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Statement Information</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
        <DatePickerField
          label="Start Date"
          name="startDate"
          defaultValue={
            data?.startDate
              ? moment(data.startDate).format("YYYY-MM-DDTHH:mm")
              : data?.startDate
          }
          control={control}
          error={errors.startDate}
        />
        <DatePickerField
          label="End Date"
          name="endDate"
          defaultValue={
            data?.endDate
              ? moment(data.endDate).format("YYYY-MM-DDTHH:mm")
              : data?.endDate
          }
          control={control}
          error={errors.endDate}
        />
        <EnumSelect
          label="Distributor"
          enumObject={InvoiceEnum}
          register={register}
          name="distributor"
          errors={errors}
          defaultValue={data?.distributor}
        />
      </div>
      <button className="bg-aztecBlue text-white py-2.5 px-4 rounded-md w-full font-medium hover:opacity-90 transition-opacity">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StatementForm;
