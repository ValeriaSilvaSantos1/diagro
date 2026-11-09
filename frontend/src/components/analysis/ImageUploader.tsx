'use client'

import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Camera, CircleAlert, ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { cn } from '@/lib/format'

export interface SelectedImage {
  dataUrl: string
  name: string
  size: number
}

const ACCEPTED = ['image/jpeg', 'image/png']
const MAX_BYTES = 10 * 1024 * 1024

/** Downscales the image so it can be kept in localStorage for the demo. */
function compress(src: string, max = 1100): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    image.onerror = reject
    image.src = src
  })
}

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const formatSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

/** Validates and loads an image file. Throws an Error with a user-facing message. */
export async function loadImageFile(file: File): Promise<SelectedImage> {
  if (!ACCEPTED.includes(file.type)) throw new Error('Formato não aceito. Envie uma imagem JPG, JPEG ou PNG.')
  if (file.size > MAX_BYTES) throw new Error('A imagem é muito grande. Envie um arquivo de até 10 MB.')
  try {
    const dataUrl = await compress(await readAsDataUrl(file))
    return { dataUrl, name: file.name, size: file.size }
  } catch {
    throw new Error('Não foi possível ler esta imagem. Tente outro arquivo.')
  }
}

interface Props {
  value: SelectedImage | null
  onChange: (v: SelectedImage | null) => void
  error?: string
}

export function ImageUploader({ value, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraKey, setCameraKey] = useState(0)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setLocalError(null)
    setBusy(true)
    try {
      onChange(await loadImageFile(file))
    } catch (e) {
      setLocalError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const shownError = localError ?? error

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {value ? (
        <div
          className={cn('overflow-hidden rounded-xl border bg-white transition', dragging ? 'border-agro ring-4 ring-agro/15' : 'border-line')}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="relative aspect-[4/3] bg-forest-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.dataUrl} alt="Pré-visualização da folha selecionada" className="absolute inset-0 size-full object-contain" />
            <span className="absolute left-3 top-3 rounded-md bg-forest-deep/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur">Pré-visualização</span>
            {dragging && <div className="absolute inset-0 grid place-items-center bg-forest-deep/60 text-sm font-semibold text-white">Solte para substituir a imagem</div>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{value.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(value.size)} · pronta para análise</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<RefreshCw className="size-4" />} onClick={() => inputRef.current?.click()}>
                Substituir
              </Button>
              <Button variant="dangerGhost" size="sm" icon={<Trash2 className="size-4" />} onClick={() => onChange(null)}>
                Remover
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Selecionar imagem da folha"
          aria-describedby="upload-help"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'group relative flex min-h-80 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-12 text-center transition lg:min-h-[420px]',
            dragging ? 'border-agro bg-mint' : 'border-agro/30 bg-mint/30 hover:border-agro/60 hover:bg-mint/60',
            shownError && 'border-danger/60 bg-danger-soft/40',
          )}
        >
          <div className="relative">
            <div className="relative mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-white text-agro shadow-card ring-1 ring-line transition group-hover:-translate-y-0.5">
              {busy ? <RefreshCw className="size-8 animate-spin" /> : <ImagePlus className="size-8" strokeWidth={1.7} />}
            </div>
            <p className="font-display text-xl font-bold text-ink">
              {dragging ? 'Solte a imagem aqui' : busy ? 'Carregando imagem…' : 'Arraste uma imagem ou clique para selecionar'}
            </p>
            <p id="upload-help" className="mt-1.5 text-sm text-muted-foreground">
              Formatos aceitos: JPG, JPEG e PNG · até 10 MB
            </p>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                size="lg"
                icon={<Upload className="size-4" />}
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
              >
                Selecionar imagem
              </Button>
              <Button
                size="lg"
                variant="outline"
                icon={<Camera className="size-4" />}
                onClick={(e) => {
                  e.stopPropagation()
                  setCameraKey((k) => k + 1)
                  setCameraOpen(true)
                }}
              >
                Usar câmera
              </Button>
            </div>
          </div>
        </div>
      )}

      {shownError && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-danger-ink" role="alert">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {shownError}
        </p>
      )}

      <CameraModal
        key={cameraKey}
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={async (dataUrl) => {
          const compressed = await compress(dataUrl)
          onChange({ dataUrl: compressed, name: `foto-camera-${Date.now()}.jpg`, size: Math.round((compressed.length * 3) / 4) })
          setCameraOpen(false)
        }}
        onFallback={() => {
          setCameraOpen(false)
          inputRef.current?.click()
        }}
      />
    </div>
  )
}

function CameraModal({ open, onClose, onCapture, onFallback }: { open: boolean; onClose: () => void; onCapture: (dataUrl: string) => void; onFallback: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Uma instância nova por abertura (key no pai), então o estado inicial já é o de "abrindo".
  const [error, setError] = useState<string | null>(() =>
    typeof navigator !== 'undefined' && !navigator.mediaDevices?.getUserMedia
      ? 'Este navegador não oferece acesso à câmera. Você pode selecionar uma imagem salva no dispositivo.'
      : null,
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open || error) return
    let stream: MediaStream | null = null
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current
            .play()
            .then(() => setReady(true))
            .catch(() => setReady(true))
        }
      })
      .catch(() => setError('Não foi possível acessar a câmera. Verifique a permissão do navegador ou selecione uma imagem salva.'))
    return () => stream?.getTracks().forEach((t) => t.stop())
    // Só ao abrir; o erro é definido pela própria tentativa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const capture = () => {
    const v = videoRef.current
    if (!v) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d')?.drawImage(v, 0, 0)
    onCapture(canvas.toDataURL('image/jpeg', 0.9))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fotografar com a câmera"
      description="Centralize uma única folha, com boa iluminação e foco na região afetada."
      size="lg"
      footer={
        error ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={onFallback} icon={<Upload className="size-4" />}>
              Selecionar imagem
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={capture} disabled={!ready} icon={<Camera className="size-4" />}>
              Capturar foto
            </Button>
          </>
        )
      }
    >
      {error ? (
        <div className="flex items-start gap-3 rounded-xl bg-warn-soft p-4 text-sm text-warn-ink">
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-forest-deep">
          <video ref={videoRef} playsInline muted className="absolute inset-0 size-full object-cover" />
          {!ready && <div className="absolute inset-0 grid place-items-center text-sm text-white/70">Iniciando câmera…</div>}
          <div className="pointer-events-none absolute inset-[18%] rounded-2xl border-2 border-dashed border-lime/80" aria-hidden />
        </div>
      )}
    </Modal>
  )
}
