'use client';
import {
  applyInvitationStyle,
  invitationStyles,
  type InvitationStyle,
} from '@/lib/invitation-styles';

export function StylePicker({
  name,
  initial,
}: {
  name: string;
  initial: InvitationStyle;
}) {
  return (
    <fieldset className="style-picker">
      <legend className="sr-only">Estilo de la invitación</legend>
      {invitationStyles.map((style) => (
        <label key={style.id} className="style-option">
          <input
            type="radio"
            name={name}
            value={style.id}
            defaultChecked={initial === style.id}
            onChange={() => applyInvitationStyle(style.id)}
          />
          <span className="style-option-body">
            <span className="style-swatches" aria-hidden="true">
              {style.swatches.map((hex) => (
                <i key={hex} style={{ background: hex }} />
              ))}
            </span>
            <strong>{style.name}</strong>
            <span>{style.note}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
