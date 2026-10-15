import { useState } from 'react'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default function Polaroid({
  src,
  className = '',
  style,
  eager = false,
  onClick,
  ariaLabel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) {
  const [ratio, setRatio] = useState(1)

  return (
    <figure
      className={`polaroid ${className}`}
      style={{ '--k': clamp(Math.sqrt(ratio), 0.72, 1.32), ...style }}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
    >
      <img
        src={src}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={(e) => setRatio(e.target.naturalWidth / e.target.naturalHeight)}
      />
    </figure>
  )
}