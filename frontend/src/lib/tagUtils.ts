export interface TagConfig {
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const PRESET_TAGS: Record<string, TagConfig> = {
  Sales: { name: "Sales", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Engineering: { name: "Engineering", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  Product: { name: "Product", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  Marketing: { name: "Marketing", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
  Design: { name: "Design", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  General: { name: "General", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" },
};

/**
 * Infer tag based on meeting title.
 */
export function getTagForMeeting(title: string): TagConfig {
  const lower = title.toLowerCase();
  if (lower.includes("sale") || lower.includes("demo") || lower.includes("client") || lower.includes("pitch")) {
    return PRESET_TAGS.Sales;
  }
  if (lower.includes("engineer") || lower.includes("sprint") || lower.includes("code") || lower.includes("standup") || lower.includes("bug")) {
    return PRESET_TAGS.Engineering;
  }
  if (lower.includes("product") || lower.includes("roadmap") || lower.includes("feature") || lower.includes("planning")) {
    return PRESET_TAGS.Product;
  }
  if (lower.includes("market") || lower.includes("launch") || lower.includes("campaign") || lower.includes("seo")) {
    return PRESET_TAGS.Marketing;
  }
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("onboard")) {
    return PRESET_TAGS.Design;
  }
  return PRESET_TAGS.General;
}
