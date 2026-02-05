"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { faClose, faPlus } from "@fortawesome/free-solid-svg-icons";
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

type OptionType = {
  value: string;
  label: string;
} & Customer;

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
    formState: { errors },
  } = useForm<AppointmentSchema>({
    resolver: zodResolver(appointmentSchema),
  });

  const [services, setServices] = useState<ServiceSchema[]>(
    data?.services ||
      data?.resource?.services ||
      (Array.isArray(data?.invoice) && data.invoice[0]?.services) ||
      [],
  );
  const [selectedService, setSelectedService] = useState<ServiceSchema | null>(
    null,
  );
  const [showServiceModal, setShowServiceModal] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [state, formAction] = useFormState(
    type === "create" ? createAppointment : updateAppointment,
    {
      success: false,
      error: false,
    },
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

  useEffect(() => {
    return () => {
      debouncedLoadCustomers.cancel();
    };
  }, [debouncedLoadCustomers]);

  useEffect(() => {
    if (state.success) {
      toast(
        `Appointment has been ${type === "create" ? "created" : "updated/drafted"}!`,
      );

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
      setValue("customerType", CustomerTypeEnum.Other);
    }
  };

  return (
    <form
      className="flex flex-col gap-4 md:gap-8 text-white"
      onSubmit={onSubmit}
    >
      <h1 className="text-lg md:text-xl font-semibold">
        {type === "create" ? "Create New Appointment" : "Update Appointment"}
      </h1>
      {isMobile && showServiceModal ? (
        <ServiceForm
          type={selectedService ? "update" : "create"}
          data={{
            onSave: handleServiceAdded,
            service: selectedService,
          }}
          setOpen={setOpen}
        />
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="flex flex-col md:w-1/2 gap-4 md:gap-8">
            <span className="text-xs text-gray-300 font-medium">
              Customer Information
            </span>
            {type === "create" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">
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
                />{" "}
              </div>
            )}

            <div className="flex justify-between flex-wrap gap-2 md:gap-4">
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

            <span className="text-xs text-gray-300 font-medium">
              Appointment Information
            </span>

            <div className="relative flex justify-between flex-wrap gap-2 md:gap-4">
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
          {/* ✅ Services Section */}
          <div className="flex flex-col gap-8 md:w-1/2">
            {!isMobile && (
              <>
                <span className="text-xs text-gray-300 font-medium">
                  Services
                </span>
                <ServiceForm
                  type={selectedService ? "update" : "create"}
                  data={{
                    onSave: handleServiceAdded,
                    service: selectedService,
                  }}
                  setOpen={setOpen}
                />
              </>
            )}
            {/* ✅ Display Selected Services */}
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
                    <FontAwesomeIcon
                      icon={faClose}
                      className="text-white w-5"
                    />
                  </button>
                </div>
              ))}
            </div>
            {/* ✅ Add Service Button (Shows ServiceForm on Mobile) */}
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
        <button className="bg-odetailBlue text-white p-2 rounded-md">
          {type === "create" ? "Create" : "Update"}
        </button>
      ) : null}
    </form>
  );
};

export default AppointmentForm;
