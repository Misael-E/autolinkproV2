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
  code: string;
  distributor: string | null;
  customerType: string;
  latestPrice: number;
  flatCharge: number;
  lastUpdated: string;
  usageCount: number;
};

const entryKey = (e: PricingEntry) =>
  `${e.code}||${e.distributor ?? ""}||${e.customerType}`;

export default function PricingBankTable({
  initialEntries,
}: {
  initialEntries: PricingEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (entry: PricingEntry) => {
    setEditingKey(entryKey(entry));
    setEditValue(entry.flatCharge.toFixed(2));
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const saveEdit = async (entry: PricingEntry) => {
    const newFlatCharge = parseFloat(editValue);
    if (isNaN(newFlatCharge) || newFlatCharge < 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pricing-bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: entry.code,
          distributor: entry.distributor,
          customerType: entry.customerType,
          flatCharge: newFlatCharge,
        }),
      });
      if (res.ok) {
        const key = entryKey(entry);
        setEntries((prev) =>
          prev.map((e) =>
            entryKey(e) === key ? { ...e, flatCharge: newFlatCharge } : e,
          ),
        );
        setEditingKey(null);
      }
    } finally {
      setSaving(false);
    }
  };

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
              Cost
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
            const cost = entry.latestPrice;
            const flatCharge = entry.flatCharge;
            const finalPrice = cost + flatCharge;
            const marginVal =
              finalPrice > 0 ? (flatCharge / finalPrice) * 100 : 0;
            const marginDisplay =
              finalPrice > 0 ? `${marginVal.toFixed(1)}%` : "—";
            const bar = finalPrice > 0 ? getMarginBar(marginVal) : null;
            const catStyle =
              categoryColors[entry.customerType] ?? categoryColors.Other;
            const key = entryKey(entry);
            const isEditing = editingKey === key;

            return (
              <tr key={i} className="hover:bg-gray-800/50 transition-colors group">
                <td className="px-5 py-3.5">
                  <span className="font-mono font-semibold text-white bg-gray-700/50 px-2 py-0.5 rounded text-xs tracking-wide">
                    {entry.code || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-300 text-xs">
                  {entry.distributor ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${catStyle}`}>
                    {entry.customerType}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-gray-300 text-sm">${cost.toFixed(2)}</span>
                </td>
                <td className="px-5 py-3.5">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 bg-gray-700 text-white text-sm rounded px-2 py-0.5 border border-odetailBlue focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(entry);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button
                        onClick={() => saveEdit(entry)}
                        disabled={saving}
                        className="text-green-400 hover:text-green-300"
                      >
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/cell">
                      <span className="text-blue-300 font-semibold text-sm">
                        ${flatCharge.toFixed(2)}
                      </span>
                      <button
                        onClick={() => startEdit(entry)}
                        className="opacity-0 group-hover/cell:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity"
                        title="Edit flat charge"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-green-400 font-bold text-sm">
                    ${finalPrice.toFixed(2)}
                  </span>
                </td>
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
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center justify-center bg-gray-700/60 text-gray-300 text-xs font-medium rounded-full w-7 h-7">
                    {entry.usageCount}
                  </span>
                </td>
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
