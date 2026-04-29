import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { barcodesApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function BarcodeScanner({ onResult, onClose }) {
  const { accessToken } = useAuth()
  const [status, setStatus] = useState('scanning')

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode('barcode-reader')
    let cancelled = false
    let started = false

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cancelled || !cameras.length) {
          if (!cancelled) setStatus('error')
          return
        }

        const backCamera = cameras.find((c) => /back|rear|environment/i.test(c.label))
        const cameraId = (backCamera ?? cameras[0]).id

        return html5Qrcode
          .start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 150 } },
            async (decodedText) => {
              started = false
              await html5Qrcode.stop()
              setStatus('loading')

              const res = await barcodesApi.lookup(accessToken, decodedText)
              if (!res) {
                setStatus('error')
                return
              }

              const data = await res.json()
              if (!res.ok || !data.found) {
                setStatus('error')
                return
              }

              onResult({
                name: data.name,
                category: data.category,
                imageUrl: data.imageUrl,
                barcode: decodedText,
                quantity: data.quantity ?? null,
                unit: data.unit ?? null,
              })
            },
            () => {}
          )
          .then(() => {
            started = true
          })
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      if (started) {
        started = false
        html5Qrcode.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      {status === 'scanning' && (
        <p className="text-sm text-gray-500">Apunta la cámara al código de barras del producto.</p>
      )}
      {status === 'loading' && <p className="text-sm text-gray-500">Buscando producto...</p>}
      {status === 'error' && (
        <p className="text-sm text-red-500">
          Producto no encontrado en la base de datos. Rellena el formulario manualmente.
        </p>
      )}

      <div id="barcode-reader" className="w-full min-h-64" />

      <Button variant="outline" size="sm" onClick={onClose}>
        Cancelar
      </Button>
    </div>
  )
}
