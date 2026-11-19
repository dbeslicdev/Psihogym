// Launch at midnight in Zagreb. The end of each promotional period is exclusive.
export const promotionStartsAt = "2026-11-18T00:00:00+01:00";

export function programPrice(program, now = Date.now()) {
  const start = Date.parse(promotionStartsAt);
  const end = start + program.promotionDays * 86_400_000;
  return now >= start && now < end ? program.promoPrice : program.price;
}
