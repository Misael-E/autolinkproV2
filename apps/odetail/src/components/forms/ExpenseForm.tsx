"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { expenseSchema, ExpenseSchema, PaymentEnum } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { createExpense, updateExpense } from "@/lib/actions/expense";
import DatePickerField from "../DateField";
import moment from "moment";
import EnumSelect from "../EnumSelect";

const ExpenseForm = ({
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
  } = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createExpense : updateExpense,
    {
      success: false,
      error: false,
    }
  );

  useEffect(() => {
    if (state.success) {
      toast(`Expense has been ${type === "create" ? "created" : "updated"}!`);
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
        Expense Information
      </span>
      <div className="flex justify-between flex-wrap gap-4 text-white">
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
        />
        <InputField
          label="Cost"
          name="cost"
          defaultValue={data?.cost}
          register={register}
          error={errors.cost}
        />
        <EnumSelect
          label="Payment Type"
          enumObject={PaymentEnum}
          register={register}
          name="paymentType"
          errors={errors}
          defaultValue={data?.paymentType}
        />
        <DatePickerField
          label="Date"
          name="date"
          defaultValue={
            data?.date
              ? moment(data.date).format("YYYY-MM-DDTHH:mm")
              : data?.date
          }
          control={control}
          error={errors.date}
        />
        <InputField
          label="Is Rent"
          name="isRent"
          type="checkbox"
          defaultValue={data?.isRent}
          register={register}
          error={errors.isRent}
        />
        <InputField
          label="Is Wage"
          name="isWage"
          type="checkbox"
          defaultValue={data?.isWage}
          register={register}
          error={errors.isWage}
        />
      </div>
      <button className="bg-odetailBlue text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExpenseForm;
