export function cn(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(" ");
}

export function formatCurrencyMad(amount: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);
}
