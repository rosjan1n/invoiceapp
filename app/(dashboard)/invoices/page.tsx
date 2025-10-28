import InvoicesDashboard from "./invoices-dashboard";
import { InvoiceFilters } from "@/types/api.types";

export default function InvoicesPage({
  searchParams,
}: {
  searchParams: InvoiceFilters;
}) {
  return <InvoicesDashboard searchParams={searchParams} />;
}
