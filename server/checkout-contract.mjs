// Server-only building block; no public endpoint or payment activation.
export function priceOrder(programIds, catalog) {
  if (!Array.isArray(programIds) || !programIds.length || programIds.length > 20 ||
      programIds.some(id => typeof id !== 'string') || new Set(programIds).size !== programIds.length)
    throw new Error('Invalid program selection');
  const items = programIds.map(id => {
    const product = Object.hasOwn(catalog, id) ? catalog[id] : null;
    if (!product || product.active !== true || !Number.isSafeInteger(product.amountCents) || product.amountCents <= 0)
      throw new Error('Unavailable product');
    return { programId: id, amountCents: product.amountCents };
  });
  const amountCents = items.reduce((sum, item) => sum + item.amountCents, 0);
  if (!Number.isSafeInteger(amountCents)) throw new Error('Invalid amount');
  return { currency: 'eur', amountCents, items };
}
