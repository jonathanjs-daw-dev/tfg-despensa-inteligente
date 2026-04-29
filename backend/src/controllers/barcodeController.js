import { lookupBarcode } from '../services/barcodeService.js'

export async function getBarcode(req, res) {
  try {
    const { code } = req.params
    if (!code) return res.status(400).json({ error: 'Código requerido' })

    const productData = await lookupBarcode(code)
    if (!productData) return res.status(404).json({ found: false })

    res.status(200).json({ found: true, ...productData })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
