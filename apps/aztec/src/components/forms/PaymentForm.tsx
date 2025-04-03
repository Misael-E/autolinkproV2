"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PaymentEnum, paymentSchema, PaymentSchema } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import DatePickerField from "../DateField";
import moment from "moment";
import EnumSelect from "../EnumSelect";
import { createPayment, updatePayment } from "@/lib/actions/payment";
import InputField from "../InputField";

const PaymentForm = ({
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
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createPayment : updatePayment,
    {
      success: false,
      error: false,
    }
  );

  useEffect(() => {
    if (state.success) {
      toast(`Payment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      statementId: id as number,
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-white">
        {type === "create" ? "Create New Payment" : "Update Payment"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Payment Information
      </span>
      <div className="flex justify-between flex-wrap gap-4 text-white">
        <DatePickerField
          label="Date Paid"
          name="paymentDate"
          defaultValue={
            data?.paymentDate
              ? moment(data.paymentDate).format("YYYY-MM-DDTHH:mm")
              : data?.paymentDate
          }
          control={control}
          error={errors.paymentDate}
        />
        <InputField
          label="Amount Paid"
          name="amount"
          defaultValue={data?.amount ?? 0}
          type="number"
          register={register}
          error={errors.amount}
        />
        <EnumSelect
          label="Payment Type"
          enumObject={PaymentEnum}
          register={register}
          name="paymentType"
          errors={errors}
        />
        <InputField
          label="Notes"
          name="note"
          defaultValue={data?.note}
          register={register}
          error={errors.note}
        />
      </div>
      <button className="bg-aztecBlue text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default PaymentForm;
