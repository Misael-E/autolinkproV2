"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { type PricingEntry } from "./PricingBankTable";

const CATEGORY_OPTIONS = ["Retailer", "Vendor", "Fleet", "Other"];

const inputCls =
  "bg-gray-700 text-white text-sm rounded px-2 py-0.5 border border-aztecBlue focus:outline-none";

export default function PricingBankNewEntryRow({
  location,
  onSave,
  onCancel,
}: {
  location: string;
  onSave: (entry: PricingEntry) => void;
  onCancel: () => void;
}) {
  const codeRef = useRef<HTMLInputElement>(null);
  const distributorRef = useRef<HTMLInputElement>(null);
  const customerTypeRef = useRef<HTMLSelectElement>(null);
  const glassCostRef = useRef<HTMLInputElement>(null);
  const flatChargeRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const code = codeRef.current?.value.trim() ?? "";
    if (!code) return;
    const gc = parseFloat(glassCostRef.current?.value ?? "0");
    const fc = parseFloat(flatChargeRef.current?.value ?? "0");
    if (isNaN(gc) || isNaN(fc)) return;
    const distributor = distributorRef.current?.value.trim() || null;
    const customerType = customerTypeRef.current?.value ?? "Retailer";
    setSaving(true);
    try {
      const res = await fetch("/api/pricing-bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, distributor, customerType, glassCost: gc, flatCharge: fc, location }),
      });
      if (res.ok) {
        const data = await res.json();
        onSave({
          id: data.id,
          code,
          distributor,
          customerType,
          glassCost: gc,
          flatCharge: fc,
          lastUpdated: new Date().toISOString(),
          usageCount: 0,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  };

  return (
    <tr className="bg-gray-800/70">
      <td className="px-5 py-3.5">
        <input type="text" placeholder="e.g. W123" defaultValue=""
          ref={codeRef} className={`${inputCls} w-24 font-mono`} autoFocus onKeyDown={onKey}
          onInput={(e) => { const t = e.currentTarget; t.value = t.value.toUpperCase(); }} />
      </td>
      <td className="px-5 py-3.5">
        <input type="text" placeholder="Supplier" defaultValue=""
          ref={distributorRef} className={`${inputCls} w-24`} onKeyDown={onKey}
          onInput={(e) => { const t = e.currentTarget; t.value = t.value.toUpperCase(); }} />
      </td>
      <td className="px-5 py-3.5">
        <select defaultValue="Retailer" ref={customerTypeRef} className={`${inputCls} w-28`}>
          {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-sm">$</span>
          <input type="number" step="0.01" defaultValue="0"
            ref={glassCostRef} className={`${inputCls} w-20`} onKeyDown={onKey} />
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-sm">$</span>
          <input type="number" step="0.01" defaultValue="0"
            ref={flatChargeRef} className={`${inputCls} w-20`} onKeyDown={onKey} />
        </div>
      </td>
      <td className="px-5 py-3.5"><span className="text-gray-600 text-xs">—</span></td>
      <td className="px-5 py-3.5"><span className="text-gray-600 text-xs">—</span></td>
      <td className="px-5 py-3.5"><span className="text-gray-600 text-xs">—</span></td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="text-green-400 hover:text-green-300 disabled:opacity-40" title="Save">
            <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
          </button>
          <button onClick={onCancel} className="text-red-400 hover:text-red-300" title="Cancel">
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
