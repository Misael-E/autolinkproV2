import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { resolveLocation } from "@/lib/resolveLocation";
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
  params,
  searchParams,
}: {
  params: { location: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") return notFound();

  const location = await resolveLocation(params.location);

  const categoryFilter = searchParams.category;
  const supplierFilter = searchParams.supplier;
  const searchFilter = searchParams.search;

  const [services, bankEntries, revenueRecords] = await Promise.all([
    prisma.service.findMany({
      where: {
        companyId: "aztec",
        locationId: location.id,
        OR: [{ invoiceId: { not: null } }, { quoteId: { not: null } }],
        code: searchFilter
          ? { contains: searchFilter, mode: "insensitive" }
          : undefined,
        distributor: supplierFilter
          ? { contains: supplierFilter, mode: "insensitive" }
          : undefined,
      },
      include: {
        invoice: { include: { customer: true } },
        quote: { include: { customer: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.pricingBankEntry.findMany({
      where: { companyId: "aztec" },
    }),
    prisma.revenue.findMany({
      where: {
        companyId: "aztec",
        costBeforeGst: { not: null },
        service: {
          companyId: "aztec",
          locationId: location.id,
          invoiceId: { not: null },
        },
      },
      include: {
        service: { include: { invoice: { include: { customer: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const flatChargeMap = new Map<string, number>();
  const bankGlassCostMap = new Map<string, number>();
  for (const entry of bankEntries) {
    const key = `${entry.code}||${entry.distributor ?? ""}||${entry.customerType}`;
    flatChargeMap.set(key, entry.flatCharge);
    const gc = (entry as any).glassCost;
    if (gc != null && gc > 0) bankGlassCostMap.set(key, gc);
  }

  // Build glass cost map from Revenue.costBeforeGst (invoice services only)
  const glassCostMap = new Map<string, number>();
  for (const rev of revenueRecords) {
    const svc = rev.service;
    if (!svc || !rev.costBeforeGst) continue;
    const customerType = svc.invoice?.customer?.customerType;
    if (!customerType) continue;
    const key = `${svc.code}||${svc.distributor ?? ""}||${customerType}`;
    if (!glassCostMap.has(key)) {
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
      const glassCost =
        bankGlassCostMap.get(key) ?? glassCostMap.get(key) ?? 0;
      grouped.set(key, {
        code: service.code,
        distributor: service.distributor,
        customerType,
        glassCost,
        flatCharge: flatChargeMap.get(key) ?? 0,
        lastUpdated: service.updatedAt.toISOString(),
        usageCount: 1,
      });
    } else {
      grouped.get(key)!.usageCount += 1;
    }
  }

  const entries = Array.from(grouped.values()).sort(
    (a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );

  const suppliers = Array.from(
    new Set(services.map((s) => s.distributor).filter(Boolean)),
  ) as string[];

  const totalUses = entries.reduce((sum, e) => sum + e.usageCount, 0);
  const avgMargin =
    entries.length > 0
      ? entries.reduce((sum, e) => {
          const finalPrice = e.glassCost + e.flatCharge;
          return sum + (finalPrice > 0 ? (e.flatCharge / finalPrice) * 100 : 0);
        }, 0) / entries.length
      : 0;

  const basePath = `/${params.location}/list/pricing-bank`;

  return (
    <div className="flex-1 m-4 mt-0 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-aztecBlack-dark rounded-xl p-5">
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
            <div className="bg-aztecBlue/20 p-2 rounded-md">
              <FontAwesomeIcon
                icon={faTag}
                className="w-4 h-4 text-aztecBlue"
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
      <div className="bg-aztecBlack-dark rounded-xl p-4 flex flex-col gap-3">
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
                    pathname: basePath,
                    query: { ...searchParams, category: cat ?? undefined },
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    (categoryFilter ?? undefined) === cat
                      ? "bg-aztecBlue text-white shadow-md shadow-aztecBlue/30"
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
                    pathname: basePath,
                    query: { ...searchParams, supplier: undefined },
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    !supplierFilter
                      ? "bg-aztecBlue text-white shadow-md shadow-aztecBlue/30"
                      : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All
                </Link>
                {suppliers.map((sup) => (
                  <Link
                    key={sup}
                    href={{
                      pathname: basePath,
                      query: { ...searchParams, supplier: sup ?? undefined },
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      supplierFilter === sup
                        ? "bg-aztecBlue text-white shadow-md shadow-aztecBlue/30"
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
      <div className="bg-aztecBlack-dark rounded-xl overflow-hidden">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="bg-gray-800 rounded-full p-5">
              <FontAwesomeIcon icon={faTag} className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-white font-medium">No pricing data yet</p>
            <p className="text-gray-500 text-sm max-w-xs">
              Prices are recorded automatically when invoices with service codes
              are created.
            </p>
          </div>
        ) : (
          <PricingBankTable
            key={`${categoryFilter ?? "all"}-${supplierFilter ?? "all"}-${searchFilter ?? ""}`}
            initialEntries={entries}
            location={params.location}
          />
        )}
      </div>
    </div>
  );
};

export default PricingBankPage;
