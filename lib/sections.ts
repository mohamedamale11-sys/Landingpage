export function displaySection(section?: string) {
  switch ((section || "").trim()) {
    case "News":
      return "Warar";
    case "Suuqyada":
      return "Suuqyada";
    case "Siyaasad & Sharci":
      return "Siyaasad & Sharci";
    case "Finance":
      return "Maaliyad";
    case "Teknoolojiyad":
      return "Teknoolojiyad";
    // Backend section label; keep internal, but display as Somali.
    case "CoinDesk Indices":
      return "Indhisyada Suuqa";
    case "Crypto Daybook Americas":
      return "Crypto Daybook (Ameerika)";
    default:
      return section || "Warar";
  }
}

