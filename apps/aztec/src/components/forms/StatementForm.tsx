"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InvoiceEnum, statementSchema, StatementSchema } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import DatePickerField from "../DateField";
import moment from "moment";
import EnumSelect from "../EnumSelect";
import { createStatement, updateStatement } from "@/lib/actions/statement";

const StatementForm = ({
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
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-white">
        {type === "create" ? "Create New Expense" : "Update Expense"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Statement Information
      </span>
      <div className="flex justify-between flex-wrap gap-4 text-white">
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
      <button className="bg-aztecBlue text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StatementForm;
