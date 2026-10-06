// =====================================================================
// CONFIGURACIÓN
// Todo se puede cambiar desde Vercel (Settings > Environment Variables)
// sin tocar el código. Si no pones nada, se usan estos valores.
// =====================================================================

module.exports = {
  // Sitio base
  BASE_URL: process.env.BASE_URL || "https://vifer.mx",

  // URL de búsqueda. {codigo} se reemplaza por lo que escribas.
  // Ajusta esto a como busque realmente vifer.mx (haz una búsqueda en
  // la página y copia la URL que te queda).
  // Ejemplos comunes:
  //   WooCommerce: https://vifer.mx/?s={codigo}&post_type=product
  //   Shopify:     https://vifer.mx/search?q={codigo}
  //   Otros:       https://vifer.mx/buscar?q={codigo}
    SEARCH_URL_TEMPLATE:
    process.env.SEARCH_URL_TEMPLATE ||
    "https://vifer.mx/busqueda?search={codigo}",
  // Opcional: si la página de cada producto se puede armar directo con el
  // código (ej. https://vifer.mx/producto/{codigo}), ponlo aquí y se salta
  // la búsqueda.
  PRODUCT_URL_TEMPLATE: process.env.PRODUCT_URL_TEMPLATE || "",

  // Selector CSS de los enlaces a productos en la página de resultados.
  PRODUCT_LINK_SELECTOR:
    process.env.PRODUCT_LINK_SELECTOR ||
    'li.product a.woocommerce-LoopProduct-link, .product a[href*="/producto"], .product a[href*="/product"], a[href*="/products/"]',

  // Selector CSS del precio (solo se usa si la página no trae el precio
  // en datos estructurados). Ejemplos: ".price", ".product-price", "[itemprop=price]"
  PRICE_SELECTOR:
    process.env.PRICE_SELECTOR ||
    'p.price ins .amount, p.price .amount, .price, [itemprop="price"], .product-price',

  // Selector CSS del nombre del producto (opcional)
  NAME_SELECTOR: process.env.NAME_SELECTOR || "h1",

  // Márgenes a sumar al precio base, en porcentaje
  MARGENES: (process.env.MARGENES || "20,25,30,35,40")
    .split(",")
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isFinite(n)),

  // Segundos que Vercel guarda en caché cada respuesta. Como los precios
  // cambian seguido, se deja corto.
  CACHE_SECONDS: Number(process.env.CACHE_SECONDS || 60),
};
