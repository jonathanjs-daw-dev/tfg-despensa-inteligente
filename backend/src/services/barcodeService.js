import prisma from '../config/db.js'

const CATEGORY_MAP = [
  { tags: ['en:dairy', 'en:milks', 'en:cheeses', 'en:yogurts', 'en:butters', 'en:creams'], category: 'LACTEOS' },
  { tags: ['en:meats', 'en:fish', 'en:seafood', 'en:poultry', 'en:beef', 'en:pork', 'en:chicken', 'en:sausages', 'en:deli-meats'], category: 'CARNES_PESCADOS' },
  { tags: ['en:fruits', 'en:vegetables', 'en:fresh-fruits', 'en:fresh-vegetables', 'en:legumes'], category: 'FRUTAS_VERDURAS' },
  { tags: ['en:cereals', 'en:breads', 'en:pastas', 'en:rice', 'en:flours', 'en:breakfast-cereals', 'en:biscuits', 'en:crackers'], category: 'CEREALES' },
  { tags: ['en:canned-foods', 'en:preserves', 'en:jarred-foods', 'en:tinned-foods', 'en:pickles'], category: 'CONSERVAS' },
  { tags: ['en:beverages', 'en:drinks', 'en:waters', 'en:juices', 'en:sodas', 'en:coffees', 'en:teas', 'en:beers', 'en:wines', 'en:spirits'], category: 'BEBIDAS' },
  { tags: ['en:frozen-foods', 'en:frozen-meals', 'en:frozen-vegetables', 'en:ice-creams'], category: 'CONGELADOS' },
  { tags: ['en:condiments', 'en:sauces', 'en:spices', 'en:oils', 'en:vinegars', 'en:mustards', 'en:ketchups', 'en:mayonnaises'], category: 'CONDIMENTOS' },
  { tags: ['en:cleaning-products', 'en:household-products', 'en:detergents', 'en:soaps'], category: 'LIMPIEZA' },
]

const UNIT_MAP = { g: 'g', kg: 'kg', mg: 'mg', ml: 'ml', cl: 'cl', oz: 'oz', lb: 'lb', l: 'L', L: 'L' }

function mapCategory(categoryTags = []) {
  for (const { tags, category } of CATEGORY_MAP) {
    if (categoryTags.some((tag) => tags.includes(tag))) return category
  }
  return 'OTROS'
}

function mapUnit(unit) {
  if (!unit) return null
  return UNIT_MAP[unit.trim()] ?? null
}

function resolveQuantity(p) {
  if (p.product_quantity) {
    const n = parseFloat(p.product_quantity)
    if (!isNaN(n)) return n
  }
  if (p.quantity) {
    const match = p.quantity.match(/^([\d.]+)\s*[a-zA-Z]/)
    if (match) return parseFloat(match[1])
  }
  return null
}

function resolveUnit(p) {
  if (p.product_quantity_unit) {
    const mapped = mapUnit(p.product_quantity_unit)
    if (mapped) return mapped
  }
  if (p.quantity) {
    const match = p.quantity.match(/[\d.]+\s*([a-zA-Z]+)/)
    if (match) return mapUnit(match[1])
  }
  return null
}

export async function lookupBarcode(code) {
  const cached = await prisma.barcodeCache.findUnique({ where: { barcode: code } })
  if (cached) return cached.productData

  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`)
  const json = await res.json()

  if (json.status !== 1 || !json.product) return null

  const p = json.product
  const productData = {
    name: p.product_name_es || p.product_name || '',
    category: mapCategory(p.categories_tags),
    brand: p.brands || '',
    imageUrl: p.image_url || null,
    quantity: resolveQuantity(p),
    unit: resolveUnit(p),
  }

  await prisma.barcodeCache.create({ data: { barcode: code, productData } })

  return productData
}
