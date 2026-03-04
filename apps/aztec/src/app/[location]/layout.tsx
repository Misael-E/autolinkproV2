import { resolveLocation } from "@/lib/resolveLocation";
import { notFound } from "next/navigation";

export default async function LocationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { location: string };
}) {
  const location = await resolveLocation(params.location);

  if (!location) notFound();

  return <>{children}</>;
}
