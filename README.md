# Precios Vifer

Escribes un código, la app lo busca en vifer.mx, toma el precio actual de la página y te muestra ese precio más 20%, 25%, 30%, 35% y 40%.

## Estructura

```
api/precio.js      -> API principal  (/api/precio?codigo=XXXX)
api/debug.js       -> diagnóstico para ajustar selectores (apagado por defecto)
lib/config.js      -> URLs, selectores y márgenes
lib/scraper.js     -> lógica que lee la página
public/index.html  -> página para buscar
```

## Subir a GitHub y Vercel

1. Crea un repositorio nuevo en GitHub y sube todo el contenido de esta carpeta.
2. En vercel.com entra con GitHub, pulsa **Add New > Project** y elige el repositorio.
3. Deja todo por defecto y pulsa **Deploy**.

## Importante: ajustar a cómo busca vifer.mx

No pude abrir vifer.mx desde mi lado (bloquea acceso automatizado), así que los valores de `lib/config.js` son una suposición típica. Hay que revisarlos una vez:

1. Entra a vifer.mx, busca un código cualquiera y copia la URL de resultados.
   Cámbiala en `SEARCH_URL_TEMPLATE` poniendo `{codigo}` donde va el código.
2. En Vercel, en **Settings > Environment Variables**, agrega `DEBUG` = `1` y vuelve a desplegar.
3. Abre `https://TU-APP.vercel.app/api/debug?codigo=UN_CODIGO_REAL`.
   Ahí verás qué enlaces de producto y qué precio encontró.
4. Si no encuentra algo, ajusta `PRODUCT_LINK_SELECTOR` o `PRICE_SELECTOR`.
   Con clic derecho > Inspeccionar en vifer.mx puedes ver la clase CSS del precio.
5. Cuando ya funcione, borra la variable `DEBUG`.

Todas las opciones de `config.js` se pueden poner como variables de entorno en Vercel sin editar el código.

## Variables de entorno disponibles

| Variable | Qué hace |
|---|---|
| `SEARCH_URL_TEMPLATE` | URL de búsqueda con `{codigo}` |
| `PRODUCT_URL_TEMPLATE` | URL directa del producto, si se arma con el código |
| `PRODUCT_LINK_SELECTOR` | Selector CSS de enlaces a productos en los resultados |
| `PRICE_SELECTOR` | Selector CSS del precio |
| `NAME_SELECTOR` | Selector CSS del nombre |
| `MARGENES` | Porcentajes separados por coma (ej. `20,25,30,35,40`) |
| `CACHE_SECONDS` | Segundos que se guarda cada respuesta (por defecto 60) |
| `DEBUG` | `1` activa `/api/debug` |

## Posibles problemas

- **Error 403 o 429**: el sitio puede estar bloqueando las consultas desde servidores. Prueba espaciar las búsquedas o subir `CACHE_SECONDS`.
- **El precio sale vacío**: la página probablemente carga el precio con JavaScript. Usa `/api/debug` para confirmarlo; en ese caso hay que buscar el JSON que usa la página para pedir los precios.
- El sitio indica en su `robots.txt` que no permite acceso automatizado. Úsalo con consultas moderadas y revisa sus términos de uso.
