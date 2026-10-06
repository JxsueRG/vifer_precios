const cheerio = require("cheerio");
const config = require("../lib/config");
const {
  getHtml,
  buildSearchUrl,
  extractProduct,
  findProductLinks,
} = require("../lib/scraper");

module.exports = async (req, res) => {
  try {
    const codigo = String(req.query.codigo || "").trim();
    if (!codigo) return res.status(400).json({ error: "Falta ?codigo=" });

    const searchUrl = buildSearchUrl(codigo);
    const page = await getHtml(searchUrl);
    const $ = cheerio.load(page.html);

    return res.status(200).json({
      busqueda: { url: searchUrl, urlFinal: page.url, status: page.status },
      titulo: $("title").text().trim(),
      precioEnEstaPagina: extractProduct(page.html),
      enlacesDeProductoEncontrados: findProductLinks(page.html, page.url).slice(0, 10),
      tieneJsonLd: $('script[type="application/ld+json"]').length > 0,
      selectoresUsados: {
        PRODUCT_LINK_SELECTOR: config.PRODUCT_LINK_SELECTOR,
        PRICE_SELECTOR: config.PRICE_SELECTOR,
      },
      largoDelHtml: page.html.length,
      inicioDelHtml: page.html.slice(0, 2500),
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
};
