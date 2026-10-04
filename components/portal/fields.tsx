"use client";

import { CalendarIcon, CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

const triggerCls =
  "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground [&_svg]:shrink-0";

/** Pilihan enum pendek — pengganti <select> native. Tulis ke form via hidden input bawaan. */
export function EnumSelect({
  name,
  options,
  defaultValue,
  placeholder = "Pilih…",
  required,
  allowEmpty,
  emptyLabel = "Semua",
  className,
}: {
  name: string;
  options: Option[] | readonly string[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  return (
    <Select name={name} defaultValue={defaultValue} required={required}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty ? <SelectItem value="">{emptyLabel}</SelectItem> : null}
        {opts.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="capitalize">{o.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Combobox cari + pilih — untuk daftar panjang (santri, pengajar, kelas). */
export function Combobox({
  name,
  options,
  defaultValue,
  placeholder = "Pilih…",
  searchPlaceholder = "Cari…",
  emptyText = "Tidak ditemukan.",
  required,
  className,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const selected = options.find((o) => o.value === value);

  if (!options.length) {
    return (
      <>
        <input type="hidden" name={name} value="" />
        <button type="button" disabled className={cn(triggerCls, "opacity-50", className)}>
          <span className="truncate text-muted-foreground">Belum ada data</span>
          <ChevronsUpDownIcon className="size-4 text-muted-foreground" aria-hidden />
        </button>
      </>
    );
  }

  return (
    <div className={className}>
      <input type="hidden" name={name} value={value} required={required && !value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-expanded={open}
              aria-label={placeholder}
              className={cn(triggerCls, !selected && "text-muted-foreground")}
            >
              <span className="truncate">{selected?.label ?? placeholder}</span>
              <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          }
        />
        <PopoverContent align="start" sideOffset={4} className="w-72 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    keywords={[o.label]}
                    onSelect={(v) => {
                      setValue(v);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      aria-hidden
                      className={cn("size-4", value === o.value ? "opacity-100" : "opacity-0")}
                    />
                    <span className="truncate">{o.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function toISODate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function formatID(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Pemilih tanggal kalender — pengganti <input type="date"> native. */
export function DatePicker({
  name,
  defaultValue,
  placeholder = "Pilih tanggal",
  allowClear,
  className,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(`${defaultValue}T00:00:00`) : undefined,
  );
  return (
    <div className={cn("flex gap-1.5", className)}>
      <input type="hidden" name={name} value={date ? toISODate(date) : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-expanded={open}
              aria-label={placeholder}
              className={cn(triggerCls, "flex-1", !date && "text-muted-foreground")}
            >
              <span className="flex items-center gap-2 truncate">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                {date ? formatID(date) : placeholder}
              </span>
            </button>
          }
        />
        <PopoverContent align="start" sideOffset={4} className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            locale={localeId}
          />
        </PopoverContent>
      </Popover>
      {allowClear && date ? (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          aria-label="Hapus tanggal"
          onClick={() => setDate(undefined)}
        >
          <XIcon className="size-3.5" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
