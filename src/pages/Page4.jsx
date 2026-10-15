import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dots from '../components/Dots.jsx'
import Polaroid from '../components/Polaroid.jsx'

const CAPTION = 'highlight of the year: gala and ft'

// load every photo from the folders, sorted by file name
const byName = (obj) =>
  Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url)

const heroFiles = byName(import.meta.glob('../images/hero.*', { eager: true, import: 'default' }))
const photoFiles = byName(
  import.meta.glob('../images/photos/*.jpg', {
    eager: true,
    import: 'default',
  })
)

const HERO = heroFiles[0] ?? photoFiles[0]
const PHOTOS = photoFiles.slice(0, 31).filter((src) => src !== HERO)

const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// Fill the screen with an even grid, leaving a clear space for the featured photo.
function buildLayout(w, h, count) {
  const base = clamp(Math.min(w / 8, h / 7, 135), 62, 135)
  const heroW = Math.min(w * 0.48, 300, h * 0.3)
  const halfW = heroW / 2 + base * 0.4
  const halfH = heroW * 0.8 + base * 0.4
  let cols = Math.max(4, Math.ceil(w / (base * 1.35)))
  let rows = Math.max(6, Math.ceil(h / (base * 1.55)))
  let cells

  do {
    cells = []
    const stepX = w / cols
    const stepY = h / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) * stepX
        const y = (r + 0.5) * stepY
        if (Math.abs(x - w / 2) < halfW && Math.abs(y - h / 2) < halfH) continue
        cells.push({ x, y, stepX, stepY })
      }
    }
    if (cells.length < count) {
      cols++
      rows++
    }
  } while (cells.length < count)

  const selected = Array.from({ length: count }, (_, i) => {
    const cellIndex = count === 1 ? Math.floor(cells.length / 2) : Math.round(i *(cells.length - 1) / (count - 1))
    return cells[cellIndex]
  })

  return selected.map((cell, i) => {
    return {
      x: cell.x + rand(-cell.stepX * 0.12, cell.stepX * 0.12),
      y: cell.y + rand(-cell.stepY * 0.12, cell.stepY * 0.12),
      size: base * rand(0.95, 1.05),
      rot: rand(-12, 12),
      delay: i * 0.06,
      dur: rand(5, 9),
    }
  })
}

function Page4() {
  const navigate = useNavigate()
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [hero, setHero] = useState(HERO)
  const [photos, setPhotos] = useState(PHOTOS)
  const [layout, setLayout] = useState(() =>
    buildLayout(window.innerWidth, window.innerHeight, PHOTOS.length)
  )

  // rebuild only when the width changes (mobile address bar fires resize on scroll)
  useEffect(() => {
    let lastW = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastW) return
      lastW = window.innerWidth
      setLayout(buildLayout(window.innerWidth, window.innerHeight, photos.length))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [photos.length])

  const swapWithHero = (index) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    const selected = photos[index]
    if (!selected) return
    setPhotos((current) => current.map((src, i) => i === index ? hero : src))
    setHero(selected)
  }

  const startDrag = (event, index) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
      originX: layout[index].x,
      originY: layout[index].y,
      moved: false,
    }
    setDraggingIndex(index)
  }

  const movePhoto = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    const elapsed = event.timeStamp - drag.lastTime
    if (elapsed > 0) {
      drag.velocityX = drag.velocityX * 0.65 + ((event.clientX - drag.lastX) / elapsed) * 0.35
      drag.velocityY = drag.velocityY * 0.65 + ((event.clientY - drag.lastY) / elapsed) * 0.35
    }
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    drag.lastTime = event.timeStamp
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true
    if (!drag.moved) return

    const margin = layout[drag.index].size / 2
    setLayout((current) => current.map((photo, index) => index === drag.index
      ? {
          ...photo,
          x: clamp(drag.originX + dx, margin, window.innerWidth - margin),
          y: clamp(drag.originY + dy, margin, window.innerHeight - margin),
        }
      : photo))
  }

  const endDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (drag.moved) {
      const current = layout[drag.index]
      const margin = current.size / 2
      const momentumX = clamp(drag.velocityX * 180, -220, 220)
      const momentumY = clamp(drag.velocityY * 180, -220, 220)
      setLayout((positions) => positions.map((photo, index) => index === drag.index
        ? {
            ...photo,
            x: clamp(current.x + momentumX, margin, window.innerWidth - margin),
            y: clamp(current.y + momentumY, margin, window.innerHeight - margin),
          }
        : photo))
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    }
    dragRef.current = null
    setDraggingIndex(null)
  }

  return (
    <>
      {/* scattered photos live outside .page so "fixed" stays relative to the screen */}
      <div className="photo-wall">
        {photos.map((src, i) => {
          const p = layout[i]
          return (
            <Polaroid
              key={src}
              src={src}
              className={`scatter${draggingIndex === i ? ' is-dragging' : ''}`}
              onClick={() => swapWithHero(i)}
              ariaLabel={`Show photo ${i + 1} as the featured photo`}
              onPointerDown={(event) => startDrag(event, i)}
              onPointerMove={movePhoto}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                '--x': `${(p.x / window.innerWidth) * 100}%`,
                '--y': `${(p.y / window.innerHeight) * 100}%`,
                '--base': `${p.size}px`,
                '--rot': `${p.rot}deg`,
                '--delay': `${p.delay}s`,
                '--dur': `${p.dur}s`,
              }}
            />
          )
        })}
      </div>

      <div className="page page4">
        <h1 className="photo-caption">{CAPTION}</h1>
        {hero && <Polaroid src={hero} className="hero-polaroid" eager />}
        <button className="button" onClick={() => navigate('/page5')}>Next</button>
        <Dots total={4} current={2} />
      </div>
    </>
  )
}

export default Page4