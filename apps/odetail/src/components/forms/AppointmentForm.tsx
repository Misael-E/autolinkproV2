"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import InputField from "../InputField";
import {
  appointmentSchema,
  AppointmentSchema,
  AppointmentStatusEnum,
  CustomerTypeEnum,
  ServiceSchema,
} from "@repo/types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFileContract, faPlus } from "@fortawesome/free-solid-svg-icons";
import ServiceForm from "./ServiceForm";
import { useFormState } from "react-dom";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useIsMobile from "@/lib/useIsMobile";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateEvent } from "@/lib/features/calendar/calendarSlice";
import { convertDatesToISO } from "@/lib/util";
import { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import { RootState } from "@/lib/store";
import { Customer } from "@repo/database";
import DatePickerField from "../DateField";
import EnumSelect from "../EnumSelect";
import _ from "lodash";
import dynamic from "next/dynamic";

const QuoteForm = dynamic(() => import("./QuoteForm"), {
  loading: () => <p className="text-white text-sm">Loading...</p>,
});

type OptionType = {
  value: string;
  label: string;
} & Customer;

type QuoteOptionType = {
  value: number;
  label: string;
  customer: Customer;
  customerType: string;
  services: any[];
};

const selectStyles = {
  control: (baseStyles: any) => ({
    ...baseStyles,
    backgroundColor: "#252525",
    borderColor: "#374151",
    borderRadius: "8px",
    fontSize: "13px",
    color: "white",
    cursor: "pointer",
    boxShadow: "none",
  }),
  option: (baseStyles: any, { isFocused, isSelected }: any) => ({
    ...baseStyles,
    backgroundColor: isSelected ? "#1194e4" : isFocused ? "#2a2a2a" : "#212121",
    color: "white",
    fontSize: "13px",
    cursor: "pointer",
  }),
  input: (baseStyles: any) => ({ ...baseStyles, color: "white", fontSize: "13px" }),
  placeholder: (baseStyles: any) => ({ ...baseStyles, color: "#6b7280", fontSize: "13px" }),
  singleValue: (baseStyles: any) => ({ ...baseStyles, color: "white", fontSize: "13px" }),
  menu: (baseStyles: any) => ({
    ...baseStyles,
    backgroundColor: "#212121",
    border: "1px solid #3a3a3a",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  }),
  menuList: (baseStyles: any) => ({
    ...baseStyles,
    backgroundColor: "#212121",
    borderRadius: "8px",
    padding: "4px",
  }),
};

const AppointmentForm = ({
  type,
  data,
  setOpen,
  setOpenEventModal,
  id,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setOpenEventModal?: Dispatch<SetStateAction<boolean>>;
  id?: number | string;
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AppointmentSchema>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerType:
        data?.resource?.customer?.customerType ||
        data?.customer?.customerType ||
        data?.customerType ||
        CustomerTypeEnum.Retailer,
    },
  });

  const [services, setServices] = useState<ServiceSchema[]>(
    data?.services ||
      data?.resource?.services ||
      (Array.isArray(data?.invoice) && data.invoice[0]?.services) ||
      [],
  );
  const [selectedService, setSelectedService] = useState<ServiceSchema | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteOptionType | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [state, formAction] = useFormState(
    type === "create" ? createAppointment : updateAppointment,
    { success: false, error: false },
  );

  const debouncedLoadCustomers = useMemo(() => {
    return _.debounce(
      (inputValue: string, callback: (options: OptionType[]) => void) => {
        fetch(`/api/customer?search=${inputValue}`)
          .then((res) => res.json())
          .then((data: Customer[]) => {
            const options = data.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName} - ${c.email}`,
              ...c,
            }));
            callback(options);
          })
          .catch(() => callback([]));
      },
      300,
    );
  }, []);

  const debouncedLoadQuotes = useMemo(() => {
    return _.debounce(
      (inputValue: string, callback: (options: QuoteOptionType[]) => void) => {
        fetch(`/api/quote?search=${inputValue}`)
          .then((res) => res.json())
          .then((data: any[]) => {
            const options = data.map((q) => ({
              value: q.id,
              label: `#${q.quoteNumber ?? q.id} — ${q.customer.firstName} ${q.customer.lastName} (${q.status})`,
              customer: q.customer,
              customerType: q.customerType,
              services: q.services,
            }));
            callback(options);
          })
          .catch(() => callback([]));
      },
      300,
    );
  }, []);

  useEffect(() => {
    return () => {
      debouncedLoadCustomers.cancel();
      debouncedLoadQuotes.cancel();
    };
  }, [debouncedLoadCustomers, debouncedLoadQuotes]);

  useEffect(() => {
    if (state.success) {
      toast(`Appointment has been ${type === "create" ? "created" : "updated/drafted"}!`);
      setOpen(false);
      setOpenEventModal?.(false);
      router.refresh();

      if (type === "update") {
        const convertedDatesToISO = convertDatesToISO(data);
        dispatch(updateEvent(convertedDatesToISO));
      }
    }
  }, [state, type, data, dispatch, router]);

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      id: id as number,
      customerId:
        type === "update" && (data.resource?.customer.id || data.customerId),
      services,
    });
  });

  const handleServiceAdded = (newService: ServiceSchema) => {
    setServices(
      (prev) =>
        prev.some((s) => s.id === newService.id)
          ? prev.map((s) => (s.id === newService.id ? newService : s))
          : [...prev, newService],
    );
    setShowServiceModal(false);
    setSelectedService(null);
  };

  const handleEditService = (service: ServiceSchema) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const watchedCustomerType = useWatch({ control, name: "customerType" });

  const customerType =
    selectedCustomer?.customerType ||
    watchedCustomerType ||
    data?.resource?.customer?.customerType ||
    data?.customer?.customerType ||
    data?.customerType ||
    "";

  const handleCustomerChange = (selectedOption: SingleValue<Customer>) => {
    setSelectedCustomer(selectedOption);
    if (selectedOption) {
      setValue("firstName", selectedOption.firstName);
      setValue("lastName", selectedOption.lastName || "");
      setValue("email", selectedOption.email || "");
      setValue("phone", selectedOption.phone);
      setValue("streetAddress1", selectedOption.streetAddress1 || "");
      setValue("customerType", selectedOption.customerType);
    } else {
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("email", "");
      setValue("phone", "");
      setValue("streetAddress1", "");
      setValue("customerType", CustomerTypeEnum.Retailer);
    }
  };

  const handleQuoteSelect = (option: QuoteOptionType | null) => {
    setSelectedQuote(option);
    if (option) {
      setValue("quoteId", option.value);
      setValue("firstName", option.customer.firstName);
      setValue("lastName", option.customer.lastName || "");
      setValue("email", option.customer.email || "");
      setValue("phone", option.customer.phone);
      setValue("streetAddress1", option.customer.streetAddress1 || "");
      setValue("customerType", option.customerType);
      const mappedServices: ServiceSchema[] = option.services.map((s: any) => ({
        id: s.id,
        serviceType: s.serviceType,
        code: s.code,
        price: s.price?.toString() ?? "0",
        quantity: s.quantity ?? 1,
        vehicleType: s.vehicleType,
        invoiceType: s.distributor ?? "",
        materialCost: s.materialCost ?? "",
        gasCost: s.gasCost ?? "",
        shopFees: s.shopFees ?? "",
        notes: s.notes ?? "",
      }));
      setServices(mappedServices);
    } else {
      setValue("quoteId", undefined);
      setServices([]);
    }
  };

  const getQuotePreFillData = () => {
    const vals = getValues();
    return {
      firstName: vals.firstName,
      lastName: vals.lastName,
      phone: vals.phone,
      email: vals.email,
      streetAddress1: vals.streetAddress1,
      customerType: customerType || vals.customerType,
      services: services.map((s) => ({ ...s, distributor: s.invoiceType })),
    };
  };

  return (
    <>
      <form
        className="flex flex-col gap-4 md:gap-6 text-white"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between pr-8">
          <h1 className="text-lg md:text-xl font-semibold">
            {type === "create" ? "Create New Appointment" : "Update Appointment"}
          </h1>
          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="flex items-center gap-2 text-xs bg-[#252525] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faFileContract} className="w-3.5" />
            Generate Quote
          </button>
        </div>
        {isMobile && showServiceModal ? (
          <ServiceForm
            type={selectedService ? "update" : "create"}
            data={{
              onSave: handleServiceAdded,
              service: selectedService,
              customerType,
            }}
            setOpen={setOpen}
          />
        ) : (
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex flex-col md:w-1/2 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Customer Information</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>
              {type === "create" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 font-medium">
                      Link from Quote
                    </label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={debouncedLoadQuotes}
                      value={selectedQuote}
                      onChange={(option) => handleQuoteSelect(option as QuoteOptionType | null)}
                      placeholder="Search by quote # or customer name..."
                      isClearable
                      styles={selectStyles}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 font-medium">
                      Select Existing Customer
                    </label>
                    <Controller
                      name="customerId"
                      control={control}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          cacheOptions
                          loadOptions={debouncedLoadCustomers}
                          value={
                            selectedCustomer && {
                              value: selectedCustomer.id,
                              label: `${selectedCustomer.firstName} ${selectedCustomer.lastName} - ${selectedCustomer.email}`,
                            }
                          }
                          onChange={(selectedOption) => {
                            field.onChange(selectedOption?.value || "");
                            handleCustomerChange(selectedOption as OptionType);
                          }}
                          placeholder="Search for a customer..."
                          isClearable
                          styles={selectStyles}
                        />
                      )}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  name="firstName"
                  defaultValue={
                    selectedCustomer
                      ? selectedCustomer.firstName
                      : data?.resource?.customer
                        ? data.resource.customer.firstName
                        : data?.customer?.firstName
                          ? data.customer.firstName
                          : data?.firstName
                  }
                  register={register}
                  error={errors.firstName}
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  defaultValue={
                    selectedCustomer
                      ? selectedCustomer.lastName
                      : data?.resource?.customer
                        ? data.resource.customer.lastName
                        : data?.customer?.lastName
                          ? data.customer.lastName
                          : data?.lastName
                  }
                  register={register}
                  error={errors.lastName}
                />
                <EnumSelect
                  label="Customer Type"
                  enumObject={CustomerTypeEnum}
                  register={register}
                  name="customerType"
                  errors={errors}
                  defaultValue={
                    selectedCustomer
                      ? selectedCustomer.customerType
                      : data?.resource?.customer
                        ? data.resource.customer.customerType
                        : data?.customer?.customerType
                          ? data.customer.customerType
                          : data?.customerType
                  }
                />
                <InputField
                  label="Email"
                  name="email"
                  defaultValue={
                    selectedCustomer
                      ? selectedCustomer.email
                      : data?.resource?.customer
                        ? data.resource.customer.email
                        : data?.customer?.email
                          ? data.customer.email
                          : data?.email
                  }
                  register={register}
                  error={errors?.email}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  defaultValue={
                    selectedCustomer
                      ? selectedCustomer.phone
                      : data?.resource?.customer
                        ? data.resource.customer.phone
                        : data?.customer?.phone
                          ? data.customer.phone
                          : data?.phone
                  }
                  register={register}
                  error={errors.phone}
                />
                <InputField
                  label="Address"
                  name="streetAddress1"
                  defaultValue={
                    selectedCustomer
                      ? selectedCustomer.streetAddress1
                      : data?.resource?.customer
                        ? data.resource.customer.streetAddress1
                        : data?.customer?.streetAddress1
                          ? data.customer.streetAddress1
                          : data?.streetAddress1
                  }
                  register={register}
                  error={errors.streetAddress1}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Appointment Information</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Title"
                  name="title"
                  defaultValue={data?.title}
                  register={register}
                  error={errors.title}
                />
                <DatePickerField
                  label="Start Time"
                  name="startTime"
                  defaultValue={data?.start ? data.start : data?.startTime}
                  control={control}
                  error={errors.startTime}
                />
                <DatePickerField
                  label="End Time"
                  name="endTime"
                  defaultValue={data?.end ? data.end : data?.endTime}
                  control={control}
                  error={errors.endTime}
                />
                <InputField
                  label="Notes"
                  name="description"
                  type="textarea"
                  defaultValue={data?.description}
                  register={register}
                  error={errors.description}
                />
                <EnumSelect
                  label="Form Status"
                  enumObject={AppointmentStatusEnum}
                  register={register}
                  name="status"
                  errors={errors}
                  defaultValue={data?.status}
                />
                {errors.startTime?.message && errors.endTime?.message && (
                  <p className="text-xs text-red-400">
                    {errors.startTime.message.toString()}
                    {errors.endTime.message.toString()}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden xl:block w-[1px] bg-gray-500"></div>
            {/* Services Section */}
            <div className="flex flex-col gap-6 md:w-1/2">
              {selectedQuote && (
                <div className="flex items-center gap-2 text-xs text-odetailBlue bg-odetailBlue/10 border border-odetailBlue/30 rounded-lg px-3 py-2">
                  <FontAwesomeIcon icon={faFileContract} className="w-3.5" />
                  Linked from Quote #{selectedQuote.label.split("—")[0].replace("#", "").trim()}
                </div>
              )}
              {!isMobile && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Services</span>
                    <div className="flex-1 h-px bg-gray-700" />
                  </div>
                  <ServiceForm
                    type={selectedService ? "update" : "create"}
                    data={{
                      onSave: handleServiceAdded,
                      service: selectedService,
                      customerType,
                    }}
                    setOpen={setOpen}
                  />
                </>
              )}
              {/* Display Selected Services */}
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-odetailBlue text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs flex-wrap cursor-pointer"
                    onClick={() => handleEditService(service)}
                  >
                    {service.serviceType} - {service.code}
                    <button
                      type="button"
                      onClick={(e) => {
                        setServices((prev) =>
                          prev.filter((s) => s.id !== service.id),
                        );
                      }}
                    >
                      <FontAwesomeIcon icon={faClose} className="text-white w-5" />
                    </button>
                  </div>
                ))}
              </div>
              {/* Add Service Button (Shows ServiceForm on Mobile) */}
              {isMobile && (
                <button
                  type="button"
                  className="bg-green-500 text-white p-3 rounded-md flex items-center justify-center w-full self-start"
                  onClick={() => setShowServiceModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="text-white w-5" />
                  Add Service
                </button>
              )}
            </div>
          </div>
        )}

        {!isMobile || !showServiceModal ? (
          <button className="bg-odetailBlue text-white py-2.5 px-4 rounded-md w-full font-medium hover:opacity-90 transition-opacity">
            {type === "create" ? "Create" : "Update"}
          </button>
        ) : null}
      </form>

      {/* Generate Quote modal */}
      {showQuoteModal && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-gray-700/50 p-6 rounded-xl relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[70%] max-h-[90vh] overflow-y-auto">
            <QuoteForm
              type="create"
              data={getQuotePreFillData()}
              setOpen={setShowQuoteModal}
            />
            <button
              type="button"
              className="absolute top-4 right-4"
              onClick={() => setShowQuoteModal(false)}
            >
              <FontAwesomeIcon icon={faClose} className="text-white w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentForm;
