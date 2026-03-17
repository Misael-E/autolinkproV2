"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const categoryColors: Record<string, string> = {
  Retailer: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Vendor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  Fleet: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  Other: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
};

const CATEGORY_OPTIONS = ["Retailer", "Vendor", "Fleet", "Other"];

const getMarginStyle = (margin: number) => {
  if (margin >= 50) return "text-green-400 font-semibold";
  if (margin >= 30) return "text-yellow-400 font-semibold";
  return "text-red-400 font-semibold";
};

const getMarginBar = (margin: number) => {
  const clamped = Math.min(100, Math.max(0, margin));
  const color =
    margin >= 50 ? "bg-green-400" : margin >= 30 ? "bg-yellow-400" : "bg-red-400";
  return { width: `${clamped}%`, color };
};

export type PricingEntry = {
  id?: number;
  code: string;
  distributor: string | null;
  customerType: string;
  glassCost: number;
  flatCharge: number;
  lastUpdated: string;
  usageCount: number;
};

type EditingCell = {
  key: string;
  field: "glassCost" | "flatCharge" | "distributor" | "customerType";
  value: string;
};

const entryKey = (e: PricingEntry) =>
  `${e.code}||${e.distributor ?? ""}||${e.customerType}`;

const inputCls =
  "bg-gray-700 text-white text-sm rounded px-2 py-0.5 border border-aztecBlue focus:outline-none";

export default function PricingBankTable({
  initialEntries,
  location,
}: {
  initialEntries: PricingEntry[];
  location: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (
    entry: PricingEntry,
    field: EditingCell["field"],
    value: string,
  ) => {
    setEditingCell({ key: entryKey(entry), field, value });
  };

  const cancelEdit = () => setEditingCell(null);

  const saveCell = async (entry: PricingEntry) => {
    if (!editingCell) return;
    setSaving(true);
    try {
      const { field, value } = editingCell;

      if (field === "glassCost" || field === "flatCharge") {
        const numVal = parseFloat(value);
        if (isNaN(numVal) || numVal < 0) return;
        const res = await fetch("/api/pricing-bank", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: entry.code,
            distributor: entry.distributor,
            customerType: entry.customerType,
            [field]: numVal,
            location,
          }),
        });
        if (res.ok) {
          const key = entryKey(entry);
          setEntries((prev) =>
            prev.map((e) => (entryKey(e) === key ? { ...e, [field]: numVal } : e)),
          );
          setEditingCell(null);
        }
      } else {
        const newDistributor =
          field === "distributor" ? (value || null) : entry.distributor;
        const newCustomerType =
          field === "customerType" ? value : entry.customerType;
        const useIdUpdate = entry.id != null;
        const res = await fetch("/api/pricing-bank", {
          method: useIdUpdate ? "PUT" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(useIdUpdate ? { id: entry.id } : {}),
            code: entry.code,
            distributor: newDistributor,
            customerType: newCustomerType,
            flatCharge: entry.flatCharge,
            glassCost: entry.glassCost,
            location,
          }),
        });
        if (res.ok) {
          const key = entryKey(entry);
          setEntries((prev) =>
            prev.map((e) =>
              entryKey(e) === key
                ? { ...e, distributor: newDistributor, customerType: newCustomerType }
                : e,
            ),
          );
          setEditingCell(null);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const isEditing = (entry: PricingEntry, field: EditingCell["field"]) =>
    editingCell?.key === entryKey(entry) && editingCell?.field === field;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700/60">
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Code
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Supplier
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Category
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Glass Cost
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Flat Charge
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Final Price
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5 w-40">
              Margin
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Uses
            </th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/40">
          {entries.map((entry, i) => {
            const finalPrice = entry.glassCost + entry.flatCharge;
            const marginVal = finalPrice > 0 ? (entry.flatCharge / finalPrice) * 100 : 0;
            const marginDisplay = finalPrice > 0 ? `${marginVal.toFixed(1)}%` : "—";
            const bar = finalPrice > 0 ? getMarginBar(marginVal) : null;
            const catStyle = categoryColors[entry.customerType] ?? categoryColors.Other;

            const editingSupplier = isEditing(entry, "distributor");
            const editingCategory = isEditing(entry, "customerType");
            const editingGlassCost = isEditing(entry, "glassCost");
            const editingFlatCharge = isEditing(entry, "flatCharge");

            return (
              <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono font-semibold text-white bg-gray-700/50 px-2 py-0.5 rounded text-xs tracking-wide">
                    {entry.code || "—"}
                  </span>
                </td>

                {/* Supplier */}
                <td className="px-5 py-3.5 text-gray-300 text-xs">
                  {editingSupplier ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingCell!.value}
                        onChange={(e) =>
                          setEditingCell((c) => c && { ...c, value: e.target.value })
                        }
                        className={`${inputCls} w-24`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCell(entry);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button onClick={() => saveCell(entry)} disabled={saving} className="text-green-400 hover:text-green-300">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/supplier">
                      <span>{entry.distributor ?? <span className="text-gray-600">—</span>}</span>
                      <button
                        onClick={() => startEdit(entry, "distributor", entry.distributor ?? "")}
                        className="opacity-0 group-hover/supplier:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity"
                        title="Edit supplier"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Category */}
                <td className="px-5 py-3.5">
                  {editingCategory ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={editingCell!.value}
                        onChange={(e) =>
                          setEditingCell((c) => c && { ...c, value: e.target.value })
                        }
                        className={`${inputCls} w-28`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCell(entry);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button onClick={() => saveCell(entry)} disabled={saving} className="text-green-400 hover:text-green-300">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/category">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${catStyle}`}>
                        {entry.customerType}
                      </span>
                      <button
                        onClick={() => startEdit(entry, "customerType", entry.customerType)}
                        className="opacity-0 group-hover/category:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity"
                        title="Edit category"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Glass Cost */}
                <td className="px-5 py-3.5">
                  {editingGlassCost ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingCell!.value}
                        onChange={(e) =>
                          setEditingCell((c) => c && { ...c, value: e.target.value })
                        }
                        className={`${inputCls} w-20`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCell(entry);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button onClick={() => saveCell(entry)} disabled={saving} className="text-green-400 hover:text-green-300">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/glasscost">
                      <span className="text-gray-300 text-sm">${entry.glassCost.toFixed(2)}</span>
                      <button
                        onClick={() => startEdit(entry, "glassCost", entry.glassCost.toFixed(2))}
                        className="opacity-0 group-hover/glasscost:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity"
                        title="Edit glass cost"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Flat Charge */}
                <td className="px-5 py-3.5">
                  {editingFlatCharge ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingCell!.value}
                        onChange={(e) =>
                          setEditingCell((c) => c && { ...c, value: e.target.value })
                        }
                        className={`${inputCls} w-20`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCell(entry);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button onClick={() => saveCell(entry)} disabled={saving} className="text-green-400 hover:text-green-300">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/flatchrg">
                      <span className="text-blue-300 font-semibold text-sm">
                        ${entry.flatCharge.toFixed(2)}
                      </span>
                      <button
                        onClick={() => startEdit(entry, "flatCharge", entry.flatCharge.toFixed(2))}
                        className="opacity-0 group-hover/flatchrg:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity"
                        title="Edit flat charge"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Final Price */}
                <td className="px-5 py-3.5">
                  <span className="text-green-400 font-bold text-sm">
                    ${finalPrice.toFixed(2)}
                  </span>
                </td>

                {/* Margin */}
                <td className="px-5 py-3.5">
                  {bar ? (
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs ${getMarginStyle(marginVal)}`}>
                        {marginDisplay}
                      </span>
                      <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bar.color}`}
                          style={{ width: bar.width }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>

                {/* Uses */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center justify-center bg-gray-700/60 text-gray-300 text-xs font-medium rounded-full w-7 h-7">
                    {entry.usageCount}
                  </span>
                </td>

                {/* Updated */}
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {new Date(entry.lastUpdated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
