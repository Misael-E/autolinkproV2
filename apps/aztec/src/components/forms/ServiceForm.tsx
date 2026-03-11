"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import InputField from "../InputField";
import EnumSelect from "../EnumSelect";
import {
  serviceSchema,
  ServiceSchema,
  InvoiceEnum,
  ServiceEnum,
  VehicleEnum,
} from "@repo/types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ServiceCatalog } from "@repo/database";
import { toast } from "react-toastify";
import { SingleValue } from "react-select";
import { useRouter } from "next/navigation";
import { useLocationSlug } from "@/lib/hooks";

type PricingMode = "flatCharge" | "margin";

const staticServices = Object.entries(ServiceEnum).map(([key, value]) => ({
  value,
  label: value,
  isStatic: true,
}));

const ServiceForm = ({
  type,
  data,
  setOpen,
  showPricingMode = false,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  showPricingMode?: boolean;
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
  const [pricingFound, setPricingFound] = useState(false);
  const [pricingMode, setPricingMode] = useState<PricingMode>("flatCharge");
  const [glassCost, setGlassCost] = useState("");
  const [multiplier, setMultiplier] = useState<number>(1);
  const [multiplierInput, setMultiplierInput] = useState("1");
  const router = useRouter();
  const locationSlug = useLocationSlug();

  const invoiceTypeValue = useWatch({ control, name: "invoiceType" });
  const watchedPrice = useWatch({ control, name: "price", defaultValue: "0" });
  const watchedMaterial = useWatch({ control, name: "materialCost", defaultValue: "0" });
  const watchedShop = useWatch({ control, name: "shopFees", defaultValue: "0" });
  const watchedGas = useWatch({ control, name: "gasCost", defaultValue: "0" });

  const finalQuotedPrice = useMemo(() => {
    const sum =
      parseFloat(glassCost || "0") +
      parseFloat(watchedPrice || "0") +
      parseFloat(watchedMaterial || "0") +
      parseFloat(watchedShop || "0") +
      parseFloat(watchedGas || "0");
    return isNaN(sum) ? 0 : sum;
  }, [glassCost, watchedPrice, watchedMaterial, watchedShop, watchedGas]);

  const lookupPricing = async (code: string, supplier?: string) => {
    if (!code || code.length < 2) return;
    const customerType = data?.customerType ?? "";
    const resolvedSupplier = supplier ?? invoiceTypeValue;
    if (!resolvedSupplier || !customerType) return;

    const params = new URLSearchParams({ code, supplier: resolvedSupplier, customerType });
    if (locationSlug) params.set("location", locationSlug);

    try {
      const res = await fetch(`/api/pricing-bank?${params.toString()}`);
      const pricing = await res.json();
      if (pricing) {
        if (showPricingMode) {
          // Quote context: populate glass cost + flat charge separately
          if (pricing.glassCost != null) setGlassCost(pricing.glassCost.toString());
          if (pricing.flatCharge != null) setValue("price", pricing.flatCharge.toString());
        } else {
          // Invoice/appointment context: price = glassCost + flatCharge (final charge)
          const finalCharge = (pricing.glassCost ?? 0) + (pricing.flatCharge ?? 0);
          setValue("price", finalCharge.toFixed(2));
        }
        if (pricing.materialCost != null) setValue("materialCost", pricing.materialCost.toString());
        if (pricing.shopFees != null) setValue("shopFees", pricing.shopFees.toString());
        if (pricing.gasCost != null) setValue("gasCost", pricing.gasCost.toString());
        setPricingFound(true);
        setTimeout(() => setPricingFound(false), 3000);
      }
    } catch {
      // silently fail — user can enter pricing manually
    }
  };

  // Re-trigger lookup when supplier changes and code is already filled
  useEffect(() => {
    if (!invoiceTypeValue) return;
    const code = getValues("code");
    if (code && code.length >= 2) {
      lookupPricing(code, invoiceTypeValue);
    }
  }, [invoiceTypeValue]);

  // Auto-compute flat charge from glassCost × multiplier in margin mode
  useEffect(() => {
    if (pricingMode !== "margin") return;
    const cost = parseFloat(glassCost);
    if (!isNaN(cost) && cost > 0) {
      setValue("price", (cost * multiplier).toFixed(2));
    }
  }, [glassCost, multiplier, pricingMode]);

  useEffect(() => {
    async function fetchServices() {
      const res = await fetch(`/api/service?location=${locationSlug}`);
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
      await fetch(`/api/service?location=${locationSlug}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: serviceData.serviceType,
          code: serviceData.code,
          price: serviceData.price,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save flat charge to pricing bank (quotes only — glass cost comes from Revenue via RevenueForm)
    if (showPricingMode && serviceData.code && serviceData.invoiceType && data?.customerType) {
      const body: Record<string, unknown> = {
        code: serviceData.code,
        distributor: serviceData.invoiceType,
        customerType: data.customerType,
        flatCharge: parseFloat(serviceData.price) || 0,
      };
      if (locationSlug) body.location = locationSlug;
      fetch("/api/pricing-bank", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
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
    }>,
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
                      (s) => s.value === data.service?.serviceType,
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
            label={pricingFound ? "Code ✓ Price found" : "Code"}
            name="code"
            defaultValue={data?.service?.code}
            register={register}
            error={errors.code}
            inputProps={{
              onBlur: (e) => lookupPricing(e.target.value),
            }}
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
          {showPricingMode ? (
            <>
              {/* Pricing mode toggle */}
              <div className="flex flex-col gap-1 col-span-full">
                <label className="text-xs text-gray-400 font-medium">Pricing Mode</label>
                <div className="flex rounded-md overflow-hidden border border-gray-600 w-fit">
                  <button
                    type="button"
                    onClick={() => setPricingMode("flatCharge")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      pricingMode === "flatCharge"
                        ? "bg-aztecBlue text-white"
                        : "bg-[#252525] text-gray-400 hover:text-white"
                    }`}
                  >
                    Flat Charge
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("margin")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      pricingMode === "margin"
                        ? "bg-aztecBlue text-white"
                        : "bg-[#252525] text-gray-400 hover:text-white"
                    }`}
                  >
                    Margin
                  </button>
                </div>
              </div>
              {pricingMode === "flatCharge" ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">Cost (Glass Cost)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={glassCost}
                      onChange={(e) => setGlassCost(e.target.value)}
                      placeholder="0.00"
                      className="bg-[#252525] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-aztecBlue"
                    />
                  </div>
                  <InputField
                    label="Flat Charge (Markup)"
                    name="price"
                    defaultValue={data?.service?.price}
                    register={register}
                    error={errors.price}
                  />
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">Cost (Glass Cost)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={glassCost}
                      onChange={(e) => setGlassCost(e.target.value)}
                      placeholder="0.00"
                      className="bg-[#252525] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-aztecBlue"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">Multiplier</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={multiplierInput}
                      onChange={(e) => setMultiplierInput(e.target.value)}
                      onBlur={(e) => {
                        const parsed = parseFloat(e.target.value);
                        const valid = !isNaN(parsed) && parsed > 0 ? parsed : 1;
                        setMultiplier(valid);
                        setMultiplierInput(String(valid));
                      }}
                      placeholder="1"
                      className="bg-[#252525] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-aztecBlue"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">Flat Charge (Markup)</label>
                    <input
                      type="text"
                      readOnly
                      value={`$${watchedPrice || "0.00"}`}
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 cursor-not-allowed"
                    />
                    <input type="hidden" {...register("price")} />
                  </div>
                </>
              )}
            </>
          ) : (
            <InputField
              label="Price"
              name="price"
              defaultValue={data?.service?.price}
              register={register}
              error={errors.price}
            />
          )}
          <InputField
            label="Material Cost"
            name="materialCost"
            defaultValue={data?.service?.materialCost || "18"}
            register={register}
            error={errors.materialCost}
          />
          <InputField
            label="Gas Cost"
            name="gasCost"
            defaultValue={data?.service?.gasCost || "20"}
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
          {/* Final quoted price summary — quotes only */}
          {showPricingMode && (
            <div className="col-span-full flex flex-col gap-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Cost + Flat Charge + Fees</span>
                <span className="text-xs text-gray-500">
                  ${parseFloat(glassCost || "0").toFixed(2)} + ${parseFloat(watchedPrice || "0").toFixed(2)} + ${(parseFloat(watchedMaterial || "0") + parseFloat(watchedShop || "0") + parseFloat(watchedGas || "0")).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Final Quoted Price</span>
                <span className="text-lg font-bold text-white">${finalQuotedPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
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
