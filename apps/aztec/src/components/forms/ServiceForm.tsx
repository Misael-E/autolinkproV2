"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import EnumSelect from "../EnumSelect";
import {
  serviceSchema,
  ServiceSchema,
  InvoiceEnum,
  ServiceEnum,
  VehicleEnum,
} from "@repo/types";
import { Dispatch, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";

const ServiceForm = ({
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
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = handleSubmit((serviceData) => {
    const newService = {
      id: type === "update" ? data?.service.id : Date.now().toString(),
      updatedAt: type === "update" && new Date(),
      ...data?.service,
      ...serviceData,
    };

    data.onSave(newService);
    reset({
      code: "",
      quantity: 1,
      price: "",
      notes: "",
      materialCost: "",
      gasCost: "",
    });
  });

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <div className="">
        <div className="flex justify-center flex-wrap gap-4 lg:gap-6 2xl:gap-8 relative">
          <EnumSelect
            label="Vehicle Type"
            enumObject={VehicleEnum}
            register={register}
            name="vehicleType"
            errors={errors}
            defaultValue={data?.service?.vehicleType}
          />
          <EnumSelect
            label="Service Type"
            enumObject={ServiceEnum}
            register={register}
            name="serviceType"
            errors={errors}
            defaultValue={data?.service?.serviceType}
          />
          <InputField
            label="Code"
            name="code"
            defaultValue={data?.service?.code}
            register={register}
            error={errors.code}
          />
          <EnumSelect
            label="Distributor"
            enumObject={InvoiceEnum}
            register={register}
            name="invoiceType"
            errors={errors}
            defaultValue={data?.service?.invoiceType}
          />
          <InputField
            label="Quantity"
            name="quantity"
            defaultValue={data?.service?.quantity ?? 1}
            type="number"
            register={register}
            error={errors.quantity}
          />
          <InputField
            label="Price"
            name="price"
            defaultValue={data?.service?.price}
            register={register}
            error={errors.price}
          />
          <InputField
            label="Material Cost"
            name="materialCost"
            defaultValue={data?.service?.materialCost || "0"}
            register={register}
            error={errors.materialCost}
          />
          <InputField
            label="Gas Cost"
            name="gasCost"
            defaultValue={data?.service?.gasCost}
            register={register}
            error={errors.gasCost}
          />
          <InputField
            label="Notes"
            name="notes"
            defaultValue={data?.service?.notes}
            register={register}
            error={errors.notes}
          />
        </div>
      </div>
      <button
        className={`py-2 px-2 rounded-full w-10 text-white transition-all duration-200
          ${
            data?.invoiceStatus === "Paid"
              ? "bg-gray-500 cursor-not-allowed opacity-50" // Disabled style
              : type === "update"
                ? "bg-aztecBlue hover:bg-aztecBlue-dark"
                : "bg-aztecGreen hover:bg-aztecGreen-dark"
          }
        `}
        onClick={onSubmit}
        disabled={data?.invoiceStatus === "Paid"}
      >
        <FontAwesomeIcon
          icon={type === "update" ? faPencil : faPlus}
          className="w-5"
        />
      </button>
    </div>
  );
};

export default ServiceForm;
