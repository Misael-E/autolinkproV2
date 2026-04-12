"use client";

import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const TableSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white w-5" />
      <input
        type="text"
        placeholder="Search..."
        defaultValue={searchParams.get("search") || ""}
        className="w-[200px] p-2 bg-transparent outline-none text-white"
        onChange={handleSearch}
      />
    </div>
  );
};

export default TableSearch;
