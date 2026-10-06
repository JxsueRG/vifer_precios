const cheerio = require("cheerio");
const config = require("../lib/config");
const {
  getHtml,
  buildSearchUrl,
  extractProduct,
  findProductLinks,
} = require("../lib/scraper");

// GET /api/debug?codigo=ABC123
// Solo funciona si en Vercel pones la variable DEBUG=1.
// Sirve para ver qué está leyendo el scraper y ajustar los selectores.
// Bórrala (o quita este archivo) cuando ya todo funcione.

  const codigo = String(req.query.codigo || "").trim();
  if (!codigo) return res.status(400).json({ error: "Falta ?codigo=" });

  const searchUrl = buildSearchUrl(codigo);

  try {
    const page = await getHtml(searchUrl);
    const $ = cheerio.load(page.html);
    const links = findProductLinks(page.html, page.url);

    return res.status(200).json({
      busqueda: { url: searchUrl, urlFinal: page.url, status: page.status },
      titulo: $("title").text().trim(),
      precioEnEstaPagina: extractProduct(page.html),
      enlacesDeProductoEncontrados: links.slice(0, 10),
      tieneJsonLd: $('script[type="application/ld+json"]').length > 0,
      selectoresUsados: {
        PRODUCT_LINK_SELECTOR: config.PRODUCT_LINK_SELECTOR,
        PRICE_SELECTOR: config.PRICE_SELECTOR,
      },
      inicioDelHtml: page.html.slice(0, 1500),
    });
  } catch (err) {
    return res.status(502).json({ error: err.message, busqueda: searchUrl });
  }
};
