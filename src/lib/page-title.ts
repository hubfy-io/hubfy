export const APP_BRAND_NAME = "Hubfy";

export function joinTitleSegments(...segments: Array<string | null | undefined>) {
  return segments
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment))
    .join(" | ");
}

export function withAppBrand(...segments: Array<string | null | undefined>) {
  const title = joinTitleSegments(...segments);
  if (!title) return APP_BRAND_NAME;
  return title === APP_BRAND_NAME ? APP_BRAND_NAME : joinTitleSegments(title, APP_BRAND_NAME);
}
