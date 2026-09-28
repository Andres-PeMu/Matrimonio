import { Heart } from 'lucide-react';

export function HeartOrnament({
  divider = false,
  className = '',
}: {
  divider?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`ornament heart-ornament${divider ? ' heart-ornament-divider' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <Heart strokeWidth={1.35} />
    </div>
  );
}
