export function formatThaiDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatThaiDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return "—";
  try {
    const d = isoOrDate.includes("T")
      ? new Date(isoOrDate)
      : new Date(`${isoOrDate}T12:00:00`);
    return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(d);
  } catch {
    return isoOrDate;
  }
}
