const cheerio = require("cheerio");
const config = require("./config");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "es-MX,es;q=0.9",
};

async function getHtml(url) {
  const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
  if (!res.ok) {
    throw new Error(`La página respondió ${res.status} al abrir ${url}`);
  }
  return { html: await res.text(), url: res.url, status: res.status };
}

// Convierte "$1,234.50", "1.234,50", "MXN 99" etc. a número
function parsePrice(value) {
  if (value === null || value === undefined) return null;
  let s = String(value).replace(/[^\d.,]/g, "");
  if (!s) return null;

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = /,\d{2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// Busca objetos tipo Product dentro de los JSON-LD de la página
function fromJsonLd($) {
  const found = [];

  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);

    const type = node["@type"];
    const isProduct = Array.isArray(type)
      ? type.includes("Product")
      : type === "Product";

    if (isProduct) found.push(node);
    Object.values(node).forEach(walk);
  };

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      walk(JSON.parse($(el).contents().text()));
    } catch (_) {
      /* JSON inválido, se ignora */
    }
  });

  for (const product of found) {
    let offers = product.offers;
    if (Array.isArray(offers)) offers = offers[0];
    const raw =
      offers && (offers.price ?? offers.lowPrice ?? offers.priceSpecification?.price);
    const price = parsePrice(raw);
    if (price !== null) {
      return { precio: price, nombre: product.name || null, fuente: "json-ld" };
    }
  }
  return null;
}

function fromMeta($) {
  const candidates = [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[itemprop="price"]',
  ];
  for (const sel of candidates) {
    const price = parsePrice($(sel).attr("content"));
    if (price !== null) {
      return {
        precio: price,
        nombre: $('meta[property="og:title"]').attr("content") || null,
        fuente: "meta",
      };
    }
  }
  return null;
}

function fromSelector($) {
  const el = $(config.PRICE_SELECTOR).first();
  if (!el.length) return null;
  const price = parsePrice(el.attr("content") || el.text());
  if (price === null) return null;
  return {
    precio: price,
    nombre: $(config.NAME_SELECTOR).first().text().trim() || null,
    fuente: "selector",
  };
}

function extractProduct(html) {
  const $ = cheerio.load(html);
  return fromJsonLd($) || fromMeta($) || fromSelector($);
}

function findProductLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = [];
  $(config.PRODUCT_LINK_SELECTOR).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const abs = new URL(href, baseUrl).href;
      if (!links.includes(abs)) links.push(abs);
    } catch (_) {
      /* href raro, se ignora */
    }
  });
  return links;
}

function buildSearchUrl(codigo) {
  const tpl = config.PRODUCT_URL_TEMPLATE || config.SEARCH_URL_TEMPLATE;
  return tpl.replace("{codigo}", encodeURIComponent(codigo));
}

// Función principal: recibe el código y regresa nombre + precio base + url
async function buscarProducto(codigo) {
  const first = await getHtml(buildSearchUrl(codigo));

  // 1) Puede que la búsqueda ya haya llevado directo a la página del producto
  let producto = extractProduct(first.html);
  let productUrl = first.url;

  // 2) Si no, abrimos el primer resultado de la lista
  if (!producto) {
    const links = findProductLinks(first.html, first.url);
    if (!links.length) return null;

    const second = await getHtml(links[0]);
    producto = extractProduct(second.html);
    productUrl = second.url;
  }

  if (!producto) return null;
  return { ...producto, url: productUrl };
}

function calcularPrecios(base) {
  return config.MARGENES.map((m) => ({
    margen: `${m}%`,
    precio: Math.round(base * (1 + m / 100) * 100) / 100,
  }));
}

module.exports = {
  buscarProducto,
  calcularPrecios,
  getHtml,
  buildSearchUrl,
  extractProduct,
  findProductLinks,
  parsePrice,
};
