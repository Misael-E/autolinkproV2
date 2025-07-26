"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({
  page,
  count,
  range = 10,
}: {
  page: number;
  count: number;
  range?: number;
}) => {
  const router = useRouter();

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };

  const currentRangeStart = Math.floor((page - 1) / range) * range + 1;
  const currentRangeEnd = Math.min(currentRangeStart + range - 1, totalPages);

  return (
    <div className="p-4 flex flex-wrap items-center justify-center gap-2 text-white">
      {/* First */}
      <button
        className="py-2 px-4 rounded-md bg-odetailBlue text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={page === 1}
        onClick={() => changePage(1)}
      >
        First
      </button>

      {/* Prev */}
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-odetailBlue text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>

      {/* Previous Range Block */}
      {currentRangeStart > 1 && (
        <button
          className="px-3 py-1 rounded-md bg-gray-600 text-xs"
          onClick={() => changePage(currentRangeStart - 1)}
        >
          {`${currentRangeStart - range}–${currentRangeStart - 1}`}
        </button>
      )}

      {/* Current Range Pages */}
      {Array.from(
        { length: currentRangeEnd - currentRangeStart + 1 },
        (_, index) => {
          const pageIndex = currentRangeStart + index;
          return (
            <button
              key={pageIndex}
              className={`px-3 py-1 rounded-md text-xs ${
                page === pageIndex ? "bg-odetailBlue" : "bg-gray-700"
              }`}
              onClick={() => changePage(pageIndex)}
            >
              {pageIndex}
            </button>
          );
        }
      )}

      {/* Next Range Block */}
      {currentRangeEnd < totalPages && (
        <button
          className="px-3 py-1 rounded-md bg-gray-600 text-xs"
          onClick={() => changePage(currentRangeEnd + 1)}
        >
          {`${currentRangeEnd + 1}–${Math.min(
            currentRangeEnd + range,
            totalPages
          )}`}
        </button>
      )}

      {/* Next */}
      <button
        className="py-2 px-4 rounded-md bg-odetailBlue text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
      >
        Next
      </button>

      {/* Last */}
      <button
        className="py-2 px-4 rounded-md bg-odetailBlue text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={page === totalPages}
        onClick={() => changePage(totalPages)}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
