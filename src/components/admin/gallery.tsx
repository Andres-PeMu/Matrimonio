'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPhoto, deleteRecord, saveRecord } from '@/actions/manage';
import type { Media } from '@/types/domain';
async function compressImage(file: File) {
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 20 * 1024 * 1024
  )
    throw new Error('Elige una imagen JPG, PNG o WebP de hasta 20 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    canvas
      .getContext('2d')!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.')),
        'image/webp',
        0.84,
      ),
    );
    return new File([blob], 'photo.webp', { type: 'image/webp' });
  } finally {
    bitmap.close();
  }
}
export function Gallery({ media }: { media: Media[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');
  return (
    <>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = e.currentTarget;
          try {
            const fd = new FormData(form);
            const file = fd.get('file');
            if (!(file instanceof File) || !file.size)
              throw new Error('Selecciona una fotografía.');
            fd.set('file', await compressImage(file));
            const result = await uploadPhoto(fd);
            setMessage(result.message);
            if (result.ok) {
              form.reset();
              setPreview('');
              router.refresh();
            }
          } catch (e) {
            setMessage(
              e instanceof Error
                ? e.message
                : 'No se pudo subir la fotografía.',
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>Un nuevo recuerdo</h2>
        <p className="muted">
          Optimizamos tus fotos antes de subirlas. Máximo 20 MB de origen y 5 MB
          después de comprimir.
        </p>
        <div className="form-grid">
          <label>
            Fotografía
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (preview) URL.revokeObjectURL(preview);
                setPreview(f ? URL.createObjectURL(f) : '');
              }}
            />
          </label>
          <label>
            Descripción accesible
            <input
              name="alt_text"
              required
              maxLength={150}
              placeholder="Una tarde juntos en el jardín"
            />
          </label>
          <label>
            Uso
            <select name="type">
              <option value="GALLERY">Galería</option>
              <option value="COVER">Portada</option>
            </select>
          </label>
          <label>
            Orden
            <input
              name="display_order"
              type="number"
              min={0}
              max={999}
              defaultValue={0}
            />
          </label>
        </div>
        {preview && (
          <Image
            unoptimized
            src={preview}
            alt="Vista previa de la foto seleccionada"
            width={240}
            height={180}
            className="upload-preview"
          />
        )}
        <button className="button" disabled={busy}>
          {busy ? 'Procesando…' : 'Subir fotografía'}
        </button>
      </form>
      <p role="status">{message}</p>
      <div className="admin-photo-grid">
        {media.map((m) => (
          <article key={m.id} className="panel">
            <Image
              src={m.url!}
              alt={m.alt_text}
              width={500}
              height={400}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const result = await saveRecord(
                    'gallery',
                    m.id,
                    Object.fromEntries(new FormData(e.currentTarget)),
                  );
                  setMessage(result.message);
                  router.refresh();
                } catch {
                  setMessage('No se pudieron guardar los cambios.');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                Descripción
                <input
                  name="alt_text"
                  defaultValue={m.alt_text}
                  required
                  maxLength={150}
                />
              </label>
              <label>
                Uso
                <select name="type" defaultValue={m.type}>
                  <option value="GALLERY">Galería</option>
                  <option value="COVER">Portada</option>
                </select>
              </label>
              <label>
                Orden
                <input
                  name="display_order"
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={m.display_order}
                />
              </label>
              <button disabled={busy} className="text-link">
                Guardar cambios
              </button>
              <button
                disabled={busy}
                className="danger text-link"
                type="button"
                onClick={async () => {
                  if (!confirm('¿Eliminar esta fotografía?')) return;
                  setBusy(true);
                  try {
                    const result = await deleteRecord('gallery', m.id);
                    setMessage(result.message);
                    router.refresh();
                  } catch {
                    setMessage('No se pudo eliminar la fotografía.');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Eliminar
              </button>
            </form>
          </article>
        ))}
      </div>
      {!media.length && (
        <div className="empty-state">
          <span>▧</span>
          <h3>Sus recuerdos, aquí</h3>
          <p>Sube la primera fotografía de la boda.</p>
        </div>
      )}
    </>
  );
}
