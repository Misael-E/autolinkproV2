"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { InputField, EnumSelect } from "@repo/ui";
import {
  invoiceSchema,
  InvoiceSchema,
  ServiceSchema,
  PaymentEnum,
  StatusEnum,
  CustomerTypeEnum,
} from "@repo/types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ServiceForm from "./ServiceForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { createInvoice, updateInvoice } from "@/lib/actions/invoice";
import { useIsMobile } from "@repo/ui";
import { toast } from "react-toastify";
import { Customer } from "@repo/database";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import _ from "lodash";

type OptionType = {
  value: string;
  label: string;
} & Customer;

const InvoiceForm = ({
  type,
  data,
  id,
  setOpen,
  locationSlug,
}: {
  type: "create" | "update";
  setOpen: Dispatch<SetStateAction<boolean>>;
  data?: any;
  id?: number | string;
  locationSlug?: string;
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
  });
  const [services, setServices] = useState<ServiceSchema[]>(
    data?.services || [],
  );
  const [selectedService, setSelectedService] = useState<ServiceSchema | null>(
    null,
  );
  const [showServiceModal, setShowServiceModal] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const customerType = useWatch({ control, name: "customerType", defaultValue: CustomerTypeEnum.Retailer });
  const [state, formAction] = useFormState(
    type === "create" ? createInvoice : updateInvoice,
    {
      success: false,
      error: false,
    },
  );

  const debouncedLoadCustomers = useMemo(() => {
    return _.debounce(
      (inputValue: string, callback: (options: OptionType[]) => void) => {
        fetch(`/api/customer?search=${inputValue}&location=${locationSlug || ""}`)
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

  useEffect(() => {
    return () => {
      debouncedLoadCustomers.cancel();
    };
  }, [debouncedLoadCustomers]);

  useEffect(() => {
    if (state.success) {
      toast(`Invoice has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      id: id as number,
      customerId: type === "update" && data.customerId,
      services,
      locationSlug: locationSlug,
    });
  });

  const handleServiceAdded = (newService: ServiceSchema) => {
    setServices(
      (prev) =>
        prev.some((s) => s.id === newService.id)
          ? prev.map((s) => (s.id === newService.id ? newService : s)) // Update existing service
          : [...prev, newService], // Add new service if it doesn't exist
    );
    setShowServiceModal(false);
    setSelectedService(null); // Reset selection
  };

  // Function to handle service edit
  const handleEditService = (service: ServiceSchema) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

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
      // Clear the fields if no customer is selected
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("email", "");
      setValue("phone", "");
      setValue("streetAddress1", "");
      setValue("customerType", CustomerTypeEnum.Retailer);
    }
  };

  return (
    <form
      className="flex flex-col gap-4 md:gap-6 text-white"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Invoice" : "Update Invoice"}
      </h1>
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
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: "#181818",
                          color: "white",
                          cursor: "pointer",
                        }),
                        option: (baseStyles, { isFocused, isSelected }) => ({
                          ...baseStyles,
                          backgroundColor: isSelected
                            ? "#1194e4"
                            : isFocused
                              ? "#212121"
                              : "#4a4a4a",
                          color: "white",
                          cursor: "pointer",
                        }),
                        input: (baseStyles) => ({
                          ...baseStyles,
                          color: "white",
                        }),
                        placeholder: (baseStyles) => ({
                          ...baseStyles,
                          color: "#aaa",
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: "white",
                        }),
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: "#4a4a4a",
                          borderRadius: "8px",
                        }),
                        menuList: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: "#4a4a4a",
                          borderRadius: "8px",
                          padding: 0,
                        }),
                      }}
                    />
                  )}
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="firstName"
                defaultValue={
                  selectedCustomer
                    ? selectedCustomer.firstName
                    : data?.customer
                      ? data?.customer.firstName
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
                    : data?.customer
                      ? data?.customer.lastName
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
                    : data?.customer
                      ? data?.customer.customerType
                      : data?.customerType
                }
              />
              <InputField
                label="Email"
                name="email"
                defaultValue={
                  selectedCustomer
                    ? selectedCustomer.email
                    : data?.customer
                      ? data?.customer.email
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
                    : data?.customer
                      ? data?.customer.phone
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
                    : data?.customer
                      ? data?.customer.streetAddress1
                      : data?.streetAddress1
                }
                register={register}
                error={errors.streetAddress1}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">Invoice Information</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EnumSelect
                label="Invoice Status"
                enumObject={StatusEnum}
                register={register}
                name="status"
                errors={errors}
                defaultValue={data?.status}
              />
              <EnumSelect
                label="Payment Type"
                enumObject={PaymentEnum}
                register={register}
                name="paymentType"
                errors={errors}
                defaultValue={data?.paymentType}
              />
            </div>
          </div>

          <div className="hidden xl:block w-[1px] bg-gray-500"></div>
          {/* Services Section */}
          <div className="flex flex-col gap-6 md:w-1/2">
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
                    invoiceStatus: data?.status,
                    customerType,
                  }}
                  setOpen={setOpen}
                />
              </>
            )}
            {/* Display Selected Services */}
            {services.length > 0 && (
              <div className="grid grid-cols-2 gap-1">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-white truncate">{service.serviceType}</span>
                      <span className="text-gray-400 truncate">{service.code} · x{service.quantity} · ${service.price}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button type="button" onClick={() => handleEditService(service)}>
                        <FontAwesomeIcon icon={faPencil} className="text-gray-400 hover:text-white w-3 h-3 transition-colors" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setServices((prev) => prev.filter((s) => s.id !== service.id))}
                      >
                        <FontAwesomeIcon icon={faClose} className="text-gray-400 hover:text-red-400 w-3 h-3 transition-colors" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        <button className="bg-aztecBlue text-white py-2.5 px-4 rounded-md w-full font-medium hover:opacity-90 transition-opacity">
          {type === "create" ? "Create" : "Update"}
        </button>
      ) : null}
    </form>
  );
};

export default InvoiceForm;
