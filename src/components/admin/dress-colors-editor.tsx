'use client';
import { useState } from 'react';
import type { DressColor } from '@/types/domain';

/** Editor de la paleta sugerida del código de vestimenta. */
export function DressColorsEditor({
  name,
  initial,
}: {
  name: string;
  initial: DressColor[];
}) {
  const [colors, setColors] = useState(initial);
  const update = (i: number, patch: Partial<DressColor>) =>
    setColors((list) => list.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <div className="dress-colors-editor">
      <input type="hidden" name={name} value={JSON.stringify(colors)} />
      {colors.length === 0 && (
        <p className="small muted">No hay colores en la paleta.</p>
      )}
      <ul>
        {colors.map((c, i) => (
          <li key={i}>
            <input
              type="color"
              value={c.hex}
              onChange={(e) => update(i, { hex: e.target.value })}
              aria-label={`Color ${i + 1}`}
            />
            <input
              value={c.name}
              onChange={(e) => update(i, { name: e.target.value })}
              maxLength={40}
              required
              aria-label={`Nombre del color ${i + 1}`}
            />
            <button
              type="button"
              className="icon-button"
              onClick={() =>
                setColors((list) => list.filter((_, j) => j !== i))
              }
              aria-label={`Quitar ${c.name || `color ${i + 1}`}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {colors.length < 24 && (
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            setColors((list) => [...list, { name: '', hex: '#d9cdea' }])
          }
        >
          Agregar color
        </button>
      )}
    </div>
  );
}
