const config = require("../lib/config");
const { buscarProducto, calcularPrecios } = require("../lib/scraper");

// GET /api/precio?codigo=ABC123
module.exports = async (req, res) => {
  const codigo = String(req.query.codigo || "").trim();

  if (!codigo) {
    return res.status(400).json({ error: "Falta el parámetro ?codigo=" });
  }

  try {
    const producto = await buscarProducto(codigo);

    if (!producto) {
      return res.status(404).json({
        error: "No se encontró el producto o no se pudo leer el precio",
        codigo,
      });
    }

    res.setHeader(
      "Cache-Control",
      `s-maxage=${config.CACHE_SECONDS}, stale-while-revalidate`
    );
    return res.status(200).json({
      codigo,
      nombre: producto.nombre,
      url: producto.url,
      precio_base: producto.precio,
      precios: calcularPrecios(producto.precio),
    });
  } catch (err) {
    return res.status(502).json({
      error: "No se pudo consultar vifer.mx",
      detalle: err.message,
    });
  }
};
