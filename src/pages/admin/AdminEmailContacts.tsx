import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Upload, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/lib/utils";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import EmailContactSheet from "@/components/admin/EmailContactSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/useCustomers";

type StatusFilter = "all" | "subscribed" | "unsubscribed" | "bounced";

const PAGE_SIZE = 100;

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  subscribed: "green",
  unsubscribed: "gray",
  bounced: "red",
};

export default function AdminEmailContacts() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { customers, loading, addCustomer, updateCustomer } = useCustomers(debouncedSearch);
  const [createOpen, setCreateOpen] = useState(false);

  const handleOpenCreate = () => setCreateOpen(true);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setCreateOpen(false);
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = "";
      });
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [statusFilter, debouncedSearch]);

  // Filter by email marketing status
  const filteredCustomers = useMemo(() => {
    if (statusFilter === "all") return customers;
    return customers.filter(
      (c) => c.email_marketing_status === statusFilter,
    );
  }, [customers, statusFilter]);

  // Paginated slice
  const visibleCustomers = useMemo(
    () => filteredCustomers.slice(0, visibleCount),
    [filteredCustomers, visibleCount],
  );

  const hasMore = visibleCount < filteredCustomers.length;

  // Infinite scroll via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((c) => c + PAGE_SIZE);
  }, [hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts = { all: customers.length, subscribed: 0, unsubscribed: 0, bounced: 0 };
    for (const c of customers) {
      const s = c.email_marketing_status as StatusFilter;
      if (s in counts) counts[s]++;
    }
    return counts;
  }, [customers]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      subscribed: t("email.contacts.subscribed"),
      unsubscribed: t("email.contacts.unsubscribed"),
      bounced: t("email.contacts.bounced"),
    };
    return map[status] ?? status;
  };

  return (
    <>
      <div className="min-w-0 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto flex min-w-0 max-w-[1200px] 3xl:max-w-[1600px] flex-col gap-6">
          {/* Page header */}
          <div className="flex min-w-0 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h1 className="min-w-0 truncate text-xl font-semibold tracking-normal text-foreground md:text-2xl">
                {t("email.contacts.title")}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 px-2.5 text-xs md:h-9 md:gap-2 md:px-4 md:text-sm"
                  onClick={() => navigate("/admin/customers/import-contacts?from=email")}
                >
                  <Upload className="size-3.5 md:size-4" />
                  <span className="hidden md:inline">Importar</span>
                </Button>
                <Button
                  size="sm"
                  className="shrink-0 gap-1 px-2.5 text-xs md:h-9 md:gap-2 md:px-4 md:text-sm"
                  onClick={handleOpenCreate}
                >
                  <Plus className="size-3.5 md:size-4" />
                  <span className="md:hidden">Novo</span>
                  <span className="hidden md:inline">Novo contato</span>
                </Button>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1 max-w-none sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground md:size-4" />
                <Input
                  placeholder={t("customers.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 pl-8 text-sm md:h-10 md:pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="h-9 w-full sm:w-[180px] md:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("email.contacts.allStatuses")} ({statusCounts.all})</SelectItem>
                  <SelectItem value="subscribed">{t("email.contacts.subscribed")} ({statusCounts.subscribed})</SelectItem>
                  <SelectItem value="unsubscribed">{t("email.contacts.unsubscribed")} ({statusCounts.unsubscribed})</SelectItem>
                  <SelectItem value="bounced">{t("email.contacts.bounced")} ({statusCounts.bounced})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="min-h-0 min-w-0 flex-1">
            {loading ? (
              <TableSkeleton columns={4} rows={8} />
            ) : filteredCustomers.length === 0 ? (
              <Card variant="bordered">
                <CardContent className="py-12 sm:py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 sm:size-16">
                      <Users className="size-7 text-primary sm:size-8" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-foreground sm:text-lg">
                      {searchInput || statusFilter !== "all"
                        ? "Nenhum contato encontrado"
                        : "Nenhum contato ainda"}
                    </h3>
                    <p className="max-w-sm text-[10px] text-muted-foreground sm:text-xs">
                      {searchInput || statusFilter !== "all"
                        ? "Tente ajustar os filtros ou a busca."
                        : t("email.contacts.description")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="bordered" className="min-w-0 overflow-hidden">
                <div className="overflow-auto">
                  <div className="min-w-[600px]">
                    <Table className="w-full table-fixed text-xs md:text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[30%]">
                            {t("common.name")}
                          </TableHead>
                          <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[35%]">
                            {t("common.email")}
                          </TableHead>
                          <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[15%]">
                            Status
                          </TableHead>
                          <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[20%]">
                            {t("customers.columns.createdAt")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="px-3 md:px-4 font-medium truncate">
                              {customer.name}
                            </TableCell>
                            <TableCell className="px-3 md:px-4 text-muted-foreground truncate">
                              {customer.email}
                            </TableCell>
                            <TableCell className="px-3 md:px-4">
                              <Badge
                                variant={
                                  STATUS_BADGE_VARIANT[customer.email_marketing_status] ??
                                  "outline"
                                }
                              >
                                {statusLabel(customer.email_marketing_status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-3 md:px-4 text-muted-foreground">
                              {formatDateTime(customer.created_at, lang)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {/* Infinite scroll sentinel */}
                {hasMore && <div ref={sentinelRef} className="h-1" />}
              </Card>
            )}
          </div>
        </div>
      </div>

      <EmailContactSheet
        open={createOpen}
        onOpenChange={handleSheetOpenChange}
        customers={customers}
        onAdd={addCustomer}
        onUpdate={updateCustomer}
      />
    </>
  );
}
