import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import TableSearch from "@/components/TableSearch";
import { CustomerTypeEnum } from "@repo/types";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faChartLine,
  faLayerGroup,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import PricingBankTable, { PricingEntry } from "@/components/PricingBankTable";

const PricingBankPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") return notFound();

  const categoryFilter = searchParams.category;
  const supplierFilter = searchParams.supplier;
  const searchFilter = searchParams.search;

  const serviceWhere = {
    companyId: "odetail",
    OR: [{ invoiceId: { not: null } }, { quoteId: { not: null } }] as any,
    code: searchFilter ? { contains: searchFilter, mode: "insensitive" as const } : undefined,
    distributor: supplierFilter ? { contains: supplierFilter, mode: "insensitive" as const } : undefined,
  };

  const [services, bankEntries, revenueRows] = await Promise.all([
    prisma.service.findMany({
      where: serviceWhere,
      include: {
        invoice: { include: { customer: true } },
        quote: { include: { customer: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.pricingBankEntry.findMany({ where: { companyId: "odetail" } }),
    // Glass cost: Revenue.costBeforeGst linked to invoice services
    prisma.revenue.findMany({
      where: {
        costBeforeGst: { not: null },
        service: { ...serviceWhere, invoiceId: { not: null } },
      },
      include: {
        service: { include: { invoice: { include: { customer: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const flatChargeMap = new Map<string, number>();
  const bankGlassCostMap = new Map<string, number>();
  const bankIdMap = new Map<string, number>();
  for (const entry of bankEntries) {
    const key = `${entry.code}||${entry.distributor ?? ""}||${entry.customerType}`;
    flatChargeMap.set(key, entry.flatCharge);
    bankIdMap.set(key, entry.id);
    const gc = (entry as any).glassCost;
    if (gc != null && gc > 0) bankGlassCostMap.set(key, gc);
  }

  // Build glass cost map: most recent Revenue.costBeforeGst per code/distributor/customerType
  const glassCostMap = new Map<string, number>();
  for (const rev of revenueRows) {
    if (!rev.service) continue;
    const customerType = rev.service.invoice?.customer?.customerType ?? "Retailer";
    const key = `${rev.service.code}||${rev.service.distributor ?? ""}||${customerType}`;
    if (!glassCostMap.has(key) && rev.costBeforeGst != null) {
      glassCostMap.set(key, rev.costBeforeGst);
    }
  }

  const grouped = new Map<string, PricingEntry>();

  for (const service of services) {
    const customerType =
      service.invoice?.customer?.customerType ??
      service.quote?.customer?.customerType ??
      "Retailer";
    if (categoryFilter && customerType !== categoryFilter) continue;
    const key = `${service.code}||${service.distributor ?? ""}||${customerType}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: bankIdMap.get(key),
        code: service.code,
        distributor: service.distributor,
        customerType,
        glassCost: bankGlassCostMap.get(key) ?? glassCostMap.get(key) ?? 0,
        flatCharge: flatChargeMap.get(key) ?? 0,
        lastUpdated: service.updatedAt.toISOString(),
        usageCount: 1,
      });
    } else {
      grouped.get(key)!.usageCount += 1;
    }
  }

  // Include manually-created bank entries that have no matching service
  for (const entry of bankEntries) {
    const key = `${entry.code}||${entry.distributor ?? ""}||${entry.customerType}`;
    if (grouped.has(key)) continue;
    if (categoryFilter && entry.customerType !== categoryFilter) continue;
    const gc = (entry as any).glassCost ?? 0;
    grouped.set(key, {
      id: entry.id,
      code: entry.code,
      distributor: entry.distributor,
      customerType: entry.customerType,
      glassCost: gc,
      flatCharge: entry.flatCharge,
      lastUpdated: entry.updatedAt.toISOString(),
      usageCount: 0,
    });
  }

  const entries = Array.from(grouped.values()).sort(
    (a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );

  const suppliers = Array.from(
    new Set([
      ...services.map((s) => s.distributor),
      ...bankEntries.map((e) => e.distributor),
    ].filter(Boolean)),
  ) as string[];

  const totalUses = entries.reduce((sum, e) => sum + e.usageCount, 0);
  const avgMargin =
    entries.length > 0
      ? entries.reduce((sum, e) => {
          const finalPrice = e.glassCost + e.flatCharge;
          return sum + (finalPrice > 0 ? (e.flatCharge / finalPrice) * 100 : 0);
        }, 0) / entries.length
      : 0;

  return (
    <div className="flex-1 m-4 mt-0 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-odetailBlack-dark rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Pricing Bank
          </h1>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full">
            <FontAwesomeIcon icon={faCircleInfo} className="w-3 h-3" />
            Admin only · derived from billed services
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Prices auto-populate when a service code is entered on an invoice.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-800/60 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-odetailBlue/20 p-2 rounded-md">
              <FontAwesomeIcon
                icon={faTag}
                className="w-4 h-4 text-odetailBlue"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{entries.length}</p>
              <p className="text-xs text-gray-400">Unique codes</p>
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-md">
              <FontAwesomeIcon
                icon={faChartLine}
                className="w-4 h-4 text-green-400"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {avgMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">Avg margin</p>
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-md">
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="w-4 h-4 text-purple-400"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalUses}</p>
              <p className="text-xs text-gray-400">Total uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-odetailBlack-dark rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <TableSearch />
        </div>
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Category
            </span>
            <div className="flex gap-2 flex-wrap">
              {[undefined, ...Object.values(CustomerTypeEnum)].map((cat) => (
                <Link
                  key={cat ?? "all"}
                  href={{
                    pathname: "/list/pricing-bank",
                    query: { ...searchParams, category: cat ?? undefined },
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    (categoryFilter ?? undefined) === cat
                      ? "bg-odetailBlue text-white shadow-md shadow-odetailBlue/30"
                      : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {cat ?? "All"}
                </Link>
              ))}
            </div>
          </div>

          {suppliers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Supplier
              </span>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={{
                    pathname: "/list/pricing-bank",
                    query: { ...searchParams, supplier: undefined },
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    !supplierFilter
                      ? "bg-odetailBlue text-white shadow-md shadow-odetailBlue/30"
                      : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All
                </Link>
                {suppliers.map((sup) => (
                  <Link
                    key={sup}
                    href={{
                      pathname: "/list/pricing-bank",
                      query: { ...searchParams, supplier: sup ?? undefined },
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      supplierFilter === sup
                        ? "bg-odetailBlue text-white shadow-md shadow-odetailBlue/30"
                        : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {sup}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-odetailBlack-dark rounded-xl overflow-hidden">
        <PricingBankTable
          key={`${categoryFilter ?? "all"}-${supplierFilter ?? "all"}-${searchFilter ?? ""}`}
          initialEntries={entries}
        />
      </div>
    </div>
  );
};

export default PricingBankPage;
