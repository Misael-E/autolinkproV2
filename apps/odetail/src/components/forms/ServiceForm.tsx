"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import EnumSelect from "../EnumSelect";
import {
  serviceSchema,
  ServiceSchema,
  InvoiceEnum,
  ServiceEnum,
  VehicleEnum,
} from "@repo/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ServiceCatalog } from "@repo/database";
import { toast } from "react-toastify";
import { SingleValue } from "react-select";

const staticServices = Object.entries(ServiceEnum).map(([key, value]) => ({
  value,
  label: value,
  isStatic: true,
}));

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
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
  });
  const [services, setServices] = useState<ServiceCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch services on load
  useEffect(() => {
    async function fetchServices() {
      const res = await fetch("/api/service");
      const result = await res.json();
      setServices(result);
    }

    fetchServices();

    if (data?.service) {
      setValue("code", data.service.code);
      setValue("price", data.service.price.toString());
      setValue("serviceType", data.service.serviceType);
      setValue("vehicleType", data.service.vehicleType);
      setValue("materialCost", data.service.materialCost);
      setValue("gasCost", data.service.gasCost);
      setValue("shopFees", data.service.shopFees);
      setValue("notes", data.service.notes);
    }
  }, [data, setValue]);

  const combinedServices = [
    ...staticServices,
    ...services.map((service) => ({
      value: service.name,
      label: service.name,
      isStatic: false,
      price: service.price ?? undefined,
      code: service.code ?? undefined,
    })),
  ];

  const handleCreateService = async (inputValue: string) => {
    setLoading(true);
    const res = await fetch("/api/service", {
      method: "POST",
      body: JSON.stringify({
        name: inputValue,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      toast.error("Failed to create service.");
      setLoading(false);
      return;
    }

    const newService = await res.json();
    setServices((prev) => [...prev, newService]);
    setValue("serviceType", newService.name);
    toast.success(`Service "${newService.name}" created.`);
    router.refresh();
    setLoading(false);
  };

  const onSubmit = handleSubmit(async (serviceData) => {
    const newService = {
      id: type === "update" ? data?.service.id : Date.now().toString(),
      updatedAt: type === "update" && new Date(),
      ...data?.service,
      ...serviceData,
    };

    data.onSave(newService);

    const isCustom = !staticServices.some((s) => s.value === serviceData.serviceType);
    if (isCustom && serviceData.serviceType) {
      await fetch("/api/service", {
        method: "PATCH",
        body: JSON.stringify({
          name: serviceData.serviceType,
          code: serviceData.code,
          price: serviceData.price,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }

    reset({
      ...getValues(),
      name: undefined,
      serviceType: "",
      code: "",
      quantity: 1,
      price: "",
      notes: "",
    });
  });

  const handleServiceSelect = (
    selectedOption: SingleValue<{
      value: string;
      label: string;
      isStatic: boolean;
      price?: number;
      code?: string;
    }>
  ) => {
    if (selectedOption) {
      const updates: Partial<Record<string, unknown>> = {
        serviceType: selectedOption.value,
      };
      if (selectedOption.price != null) updates.price = selectedOption.price.toString();
      if (selectedOption.code != null) updates.code = selectedOption.code;
      reset({ ...getValues(), ...updates });
    } else {
      setValue("serviceType", "");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
          <EnumSelect
            label="Vehicle Type"
            enumObject={VehicleEnum}
            register={register}
            name="vehicleType"
            errors={errors}
            defaultValue={data?.service?.vehicleType}
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium">Service Type</label>
            <Controller
              name="name"
              control={control}
              defaultValue={data.service?.name}
              render={({ field }) => (
                <CreatableSelect
                  {...field}
                  options={combinedServices}
                  getOptionLabel={(option) => {
                    return option.isStatic
                      ? `${option.label} (Default)`
                      : `${option.label} (Custom)`;
                  }}
                  isLoading={loading}
                  onCreateOption={handleCreateService}
                  onChange={(option) => {
                    field.onChange(option?.value || "");
                    handleServiceSelect(option);
                  }}
                  value={
                    combinedServices.find((s) => s.value === field.value) ||
                    combinedServices.find(
                      (s) => s.value === data.service?.serviceType
                    ) ||
                    null
                  }
                  placeholder="Select or create service"
                  isClearable
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: "#252525",
                      borderColor: "#374151",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "white",
                      cursor: "pointer",
                      boxShadow: "none",
                    }),
                    option: (baseStyles, { isFocused, isSelected }) => ({
                      ...baseStyles,
                      backgroundColor: isSelected
                        ? "#1194e4"
                        : isFocused
                          ? "#2a2a2a"
                          : "#212121",
                      color: "white",
                      fontSize: "13px",
                      cursor: "pointer",
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: "white",
                      fontSize: "13px",
                    }),
                    placeholder: (baseStyles) => ({
                      ...baseStyles,
                      color: "#6b7280",
                      fontSize: "13px",
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: "white",
                      fontSize: "13px",
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: "#212121",
                      border: "1px solid #3a3a3a",
                      borderRadius: "8px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }),
                    menuList: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: "#212121",
                      borderRadius: "8px",
                      padding: "4px",
                    }),
                  }}
                />
              )}
            />
          </div>
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
            defaultValue={data?.service?.distributor}
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
            defaultValue={data?.service?.materialCost || "18"}
            register={register}
            error={errors.materialCost}
          />
          <InputField
            label="Shop Fees"
            name="shopFees"
            defaultValue={data?.service?.shopFees || "12"}
            register={register}
            error={errors.shopFees}
          />
          <InputField
            label="Notes"
            name="notes"
            defaultValue={data?.service?.notes}
            register={register}
            error={errors.notes}
          />
      </div>
      <button
        className={`py-2 px-2 rounded-full w-10 text-white transition-all duration-200
          ${
            data?.invoiceStatus === "Paid"
              ? "bg-gray-500 cursor-not-allowed opacity-50" // Disabled style
              : type === "update"
                ? "bg-odetailBlue hover:bg-odetailBlue-dark"
                : "bg-odetailGreen hover:bg-odetailGreen-dark"
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
