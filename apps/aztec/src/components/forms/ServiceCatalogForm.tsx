"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { serviceCatalogSchema, ServiceCatalogSchema } from "@repo/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import {
  createServiceCatalog,
  updateServiceCatalog,
} from "@/lib/actions/serviceCatalog";

const ServiceCatalogForm = ({
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
  } = useForm<ServiceCatalogSchema>({
    resolver: zodResolver(serviceCatalogSchema),
  });
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createServiceCatalog : updateServiceCatalog,
    {
      success: false,
      error: false,
    }
  );

  useEffect(() => {
    if (state.success) {
      toast(
        `Service catalog has been ${type === "create" ? "created" : "updated"}!`
      );
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
        {type === "create" ? "Create New Service" : "Update Service"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Catalog Information
      </span>
      <div className="flex justify-between flex-wrap gap-4 text-white">
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
        />
        <InputField
          label="Cost"
          name="price"
          defaultValue={data?.price}
          register={register}
          error={errors.price}
        />
        <InputField
          label="Package"
          name="isPackage"
          defaultValue={data?.isPackage}
          register={register}
          error={errors.isPackage}
          type="checkbox"
        />
      </div>
      <button className="bg-aztecBlue text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ServiceCatalogForm;
