export interface CountryCurrency {
  code: string;
  country: string;
  currency: string;
  symbol: string;
}

export const COUNTRIES: CountryCurrency[] = [
  { code: "US", country: "United States", currency: "USD", symbol: "$" },
  { code: "GB", country: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", country: "Eurozone", currency: "EUR", symbol: "€" },
  { code: "JP", country: "Japan", currency: "JPY", symbol: "¥" },
  { code: "CN", country: "China", currency: "CNY", symbol: "¥" },
  { code: "IN", country: "India", currency: "INR", symbol: "₹" },
  { code: "BD", country: "Bangladesh", currency: "BDT", symbol: "৳" },
  { code: "PK", country: "Pakistan", currency: "PKR", symbol: "₨" },
  { code: "CA", country: "Canada", currency: "CAD", symbol: "C$" },
  { code: "AU", country: "Australia", currency: "AUD", symbol: "A$" },
  { code: "BR", country: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "MX", country: "Mexico", currency: "MXN", symbol: "MX$" },
  { code: "SG", country: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "HK", country: "Hong Kong", currency: "HKD", symbol: "HK$" },
  { code: "KR", country: "South Korea", currency: "KRW", symbol: "₩" },
  { code: "RU", country: "Russia", currency: "RUB", symbol: "₽" },
  { code: "TR", country: "Turkey", currency: "TRY", symbol: "₺" },
  { code: "SA", country: "Saudi Arabia", currency: "SAR", symbol: "﷼" },
  { code: "AE", country: "UAE", currency: "AED", symbol: "د.إ" },
  { code: "ZA", country: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "NG", country: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "KE", country: "Kenya", currency: "KES", symbol: "KSh" },
  { code: "CH", country: "Switzerland", currency: "CHF", symbol: "Fr" },
  { code: "SE", country: "Sweden", currency: "SEK", symbol: "kr" },
  { code: "NO", country: "Norway", currency: "NOK", symbol: "kr" },
  { code: "DK", country: "Denmark", currency: "DKK", symbol: "kr" },
  { code: "TH", country: "Thailand", currency: "THB", symbol: "฿" },
  { code: "MY", country: "Malaysia", currency: "MYR", symbol: "RM" },
  { code: "PH", country: "Philippines", currency: "PHP", symbol: "₱" },
  { code: "ID", country: "Indonesia", currency: "IDR", symbol: "Rp" },
  { code: "VN", country: "Vietnam", currency: "VND", symbol: "₫" },
  { code: "EG", country: "Egypt", currency: "EGP", symbol: "E£" },
  { code: "AR", country: "Argentina", currency: "ARS", symbol: "AR$" },
  { code: "CL", country: "Chile", currency: "CLP", symbol: "CLP$" },
  { code: "CO", country: "Colombia", currency: "COP", symbol: "COL$" },
  { code: "NZ", country: "New Zealand", currency: "NZD", symbol: "NZ$" },
  { code: "IL", country: "Israel", currency: "ILS", symbol: "₪" },
];

export function getCurrencyByCode(code: string): CountryCurrency | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  const country = getCurrencyByCode(code);
  return country?.symbol || code;
}
