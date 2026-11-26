export function getWhatsAppOrderUrl(product) {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  const categoryLabel = product.store_type === 'candles' ? 'Candle' : 'Crochet';
  const message = `Hi! I'd like to order from your ${categoryLabel} collection:\n\n• Product: ${product.name}\n• Price: ₹${product.price}\n\nIs this available?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}