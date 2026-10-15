import { useEffect, useRef } from 'react'

const COLOR = '255,105,200'

const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = 0, h = 0, scale = 1, raf
    let particles = []

    const spawn = (type, fromBottom = false) => {
      const cfg = {
        blob:  { r: [60, 120], vy: [0.05, 0.15], a: [0.15, 0.3] },
        dot:   { r: [1, 4],    vy: [0.1, 0.4],   a: [0.5, 0.9] },
        heart: { r: [15, 35],  vy: [0.1, 0.3],   a: [0.3, 0.6] },
      }[type]
      const r = rand(...cfg.r) * scale
      return {
        type, r,
        x: rand(0, w),                        // full width
        y: fromBottom ? h + r * 2 : rand(0, h),
        vy: rand(...cfg.vy),
        alpha: rand(...cfg.a),
        phase: rand(0, Math.PI * 2),
        rot: rand(-0.5, 0.5),
      }
    }

    const init = () => {
      const area = w * h
      const blobs  = Math.round(clamp(area / 60000, 4, 14))
      const dots   = Math.round(clamp(area / 9000, 30, 90))
      const hearts = Math.round(clamp(area / 45000, 6, 14))
      particles = [
        ...Array.from({ length: blobs },  () => spawn('blob')),
        ...Array.from({ length: dots },   () => spawn('dot')),
        ...Array.from({ length: hearts }, () => spawn('heart')),
      ]
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const newW = window.innerWidth
      const widthChanged = newW !== w

      w = newW
      h = window.innerHeight
      scale = clamp(Math.min(w, h) / 500, 0.7, 1.5)

      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (widthChanged || particles.length === 0) init()
    }

    const drawGlow = (p, a) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
      g.addColorStop(0, `rgba(${COLOR},${a})`)
      g.addColorStop(1, `rgba(${COLOR},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawHeart = (p, a) => {
      const s = p.r
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.translate(0, -s / 2)
      ctx.strokeStyle = `rgba(${COLOR},${a})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, s / 4)
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 4)
      ctx.bezierCurveTo(-s / 2, s / 2, 0, s * 0.7, 0, s)
      ctx.bezierCurveTo(0, s * 0.7, s / 2, s / 2, s / 2, s / 4)
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 4)
      ctx.stroke()
      ctx.restore()
    }

    const loop = (t) => {
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p, i) => {
        p.y -= p.vy
        p.x += Math.sin(t * 0.001 + p.phase) * 0.3
        const a = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.002 + p.phase))

        if (p.type === 'heart') drawHeart(p, a)
        else drawGlow(p, a)

        if (p.y < -p.r * 2) particles[i] = spawn(p.type, true)
      })

      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}