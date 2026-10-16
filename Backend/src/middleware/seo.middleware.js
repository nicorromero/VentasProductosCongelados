// Backend/src/middleware/seo.middleware.js
// Middleware to generate dynamic SEO meta tags, Open Graph, Twitter Cards, and JSON‑LD markup

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Helper to truncate text to a maximum length (adds ellipsis if trimmed)
const truncate = (text, max) =>
  text && text.length > max ? text.slice(0, max - 1).trim() + "…" : text;

// Build JSON‑LD for a Product schema
const buildProductLD = (product, req) => ({
  "@context": "https://schema.org/",
  "@type": "Product",
  name: product.name,
  image: [product.image],
  description: truncate(product.description, 160),
  sku: product._id?.toString(),
  brand: { "@type": "Brand", name: "Ventas Congelados" },
  offers: {
    "@type": "Offer",
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    priceCurrency: "ARS",
    price: product.price,
    availability:
      product.active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  }
});

// Optional: extend with other types (e.g., Recipe) later

module.exports = (type = "product") => async (req, res, next) => {
  // Expose a helper on the response object that returns the full <head> fragment
  res.locals.renderSeo = (resource) => {
    const title = truncate(resource.name, 60);
    const description = truncate(resource.description, 160);
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const image = resource.image;

    const jsonLd = type === "product" ? buildProductLD(resource, req) : {};

    const tags = `
      <title>${escapeHtml(title)}</title>
      <meta name="description" content="${escapeHtml(description)}" />
      <meta property="og:title" content="${escapeHtml(title)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      <meta property="og:image" content="${escapeHtml(image)}" />
      <meta property="og:url" content="${escapeHtml(url)}" />
      <meta property="og:type" content="${type}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      <meta name="twitter:image" content="${escapeHtml(image)}" />
      <script type="application/ld+json">
        ${JSON.stringify(jsonLd, null, 2)}
      </script>
    `.trim();

    return tags;
  };
  next();
};
