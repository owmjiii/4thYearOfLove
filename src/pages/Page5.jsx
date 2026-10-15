import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import Dots from '../components/Dots.jsx'

/* ✏️ EDIT YOUR LETTER HERE ---------------------------------------- */
const TITLE = ['Happy 4th Year of Us love!', 'Parang gusto ko bumalik sa umpisa....']

// a blank line = new paragraph, a single line break stays inside the paragraph
const LETTER = `
HOY K! alam mo ba na sobrang thankful ko kasi nakita ko agad to sa bio mo? When I remember those times parang kaya kong bumalik, parang kaya ko i-relive sa imagination ko yung happiness, kilig, at kaba na nararamdaman ko nung panahon na yun.

Kaya naniniwala ako na yung relationship natin is very genuine. For sure na legit na legit, kasi it starts accidentally, you assume i assume. And this, ito na yung bunga ng pagiging assuming nating dalawa.

4 Years of love, joy, care, and also there are moments na malungkot, na napaiyak kita, na nag-away tayo. Pero all that feelings, all that moments, it always lead to having both of us together padin. Sa huli tayo pa din, sa huli andiyan ka pa din sa tabi ko at nandito pa din ako sa tabi mo. For the past 4 years, madami ako natutunan sayo, at may mga bagay pa na nagawa na never ko pa na try lalo na this year.

And I'm very very grateful in every bit of it. You made me experience things that I never experience before, mga experiences na takot ako gawin. But with you, I believe I'm safe, I believe I can do those things na pwede ko naman i-try. (Yung mga gala natin tinutukoy ko haa)

Kaya please have faith in me, na magagawa din natin yung iba omki?

Thank you very very much for all your sacrifices, pag-iintindi, at walang sawang pagmamahal sakin.

I love you always baby, and no matter what I will always be here for you, for us. Always remember na sayo lang ako, ikaw lang ang K ko. And I will always be your M. And this M will love you endlessly and unconditionally. To many many more foodtrips and gala! I can't wait to tell this stories talaga sa wedding day natin nyahahaha

(I'm sure that you will love this gift of mine, I'm sorry if hindi ko keri bumili ng mga material gifts as of the moment. I promise to bawi soon enoughhhh)

Oh to live to love, I love you so much baby!
`

const SPEED = 1 // writing speed: 0.7 = slower, 1.5 = faster
/* ------------------------------------------------------------------ */

const rand = (a, b) => a + Math.random() * (b - a)

/* ---------- torn paper: pale outer rim + inner paper ---------- */
function tornPair() {
  const steps = 34
  const side = 12
  const topJ = Array.from({ length: steps + 1 }, () => rand(2, 12))
  const botJ = Array.from({ length: steps + 1 }, () => rand(2, 12))
  const rightJ = Array.from({ length: side - 1 }, () => rand(0, 6))
  const leftJ = Array.from({ length: side - 1 }, () => rand(0, 6))

  const build = (inset) => {
    const j = () => (inset ? rand(0, 2.5) : 0)
    const pts = []
    for (let i = 0; i <= steps; i++)
      pts.push(`${((i / steps) * 100).toFixed(2)}% ${(topJ[i] + inset + j()).toFixed(1)}px`)
    for (let i = 1; i < side; i++)
      pts.push(`calc(100% - ${(rightJ[i - 1] + inset + j()).toFixed(1)}px) ${((i / side) * 100).toFixed(2)}%`)
    for (let i = steps; i >= 0; i--)
      pts.push(`${((i / steps) * 100).toFixed(2)}% calc(100% - ${(botJ[i] + inset + j()).toFixed(1)}px)`)
    for (let i = side - 1; i >= 1; i--)
      pts.push(`${(leftJ[i - 1] + inset + j()).toFixed(1)}px ${((i / side) * 100).toFixed(2)}%`)
    return `polygon(${pts.join(',')})`
  }
  return [build(0), build(rand(3.5, 5))]
}

/* ---------- split into words + a pen schedule (ms) ---------- */
function buildModel() {
  const paragraphs = LETTER.trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const sources = [
    { kind: 'title', text: TITLE.join('\n') },
    ...paragraphs.map((text) => ({ kind: 'p', text })),
  ]

  let n = 0
  let clock = 700
  const starts = []
  const durs = []

  const blocks = sources.map((b, bi) => {
    if (bi > 0) clock += 380 / SPEED // pen lifts between paragraphs
    const words = []
    b.text.split('\n').forEach((line, li, arr) => {
      line.split(/\s+/).filter(Boolean).forEach((t) => {
        const dur = (40 + t.length * 24) / SPEED // longer word = longer stroke
        starts.push(clock)
        durs.push(dur)
        words.push({ t, i: n++ })
        clock += dur

        let gap = 40
        if (/[.!?…]+["')]*$/.test(t)) gap += 280
        else if (/[,;:—-]$/.test(t)) gap += 120
        clock += gap / SPEED
      })
      if (li < arr.length - 1) {
        words.push({ br: true })
        clock += 160 / SPEED
      }
    })
    return { kind: b.kind, words }
  })

  return { blocks, starts, durs, count: n, end: clock }
}

/* ---------- glowing pen tip + sparkles (canvas) ---------- */
const fx = { ps: [], tip: null }
const addParticle = (p) => { if (fx.ps.length < 120) fx.ps.push({ g: 0, vr: 0, rot: 0, ...p }) }

function Page5() {
  const model = useMemo(buildModel, [])
  const [outer, inner] = useMemo(tornPair, [])
  const [phase, setPhase] = useState('writing') // writing | done
  const [run, setRun] = useState(0)

  const bodyRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  /* ---- canvas: pen glow + sparkles ---- */
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf, w = 0, h = 0, frame = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    fx.ps.length = 0

    const loop = (now) => {
      frame++
      ctx.clearRect(0, 0, w, h)

      const tip = fx.tip
      if (tip) {
        const pulse = 0.75 + 0.25 * Math.sin(now / 120)
        const g = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 30)
        g.addColorStop(0, `rgba(255,255,255,${0.9 * pulse})`)
        g.addColorStop(0.25, `rgba(255,105,200,${0.55 * pulse})`)
        g.addColorStop(1, 'rgba(255,105,200,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(tip.x, tip.y, 30, 0, Math.PI * 2)
        ctx.fill()

        if (frame % 2 === 0) {
          addParticle({
            x: tip.x + rand(-4, 4), y: tip.y + rand(-6, 6),
            vx: rand(-0.4, 0.4), vy: rand(-0.7, -0.1),
            life: 1, decay: 0.03, size: rand(4, 9),
          })
        }
        if (frame % 26 === 0) {
          addParticle({
            x: tip.x, y: tip.y,
            vx: rand(-0.4, 0.4), vy: -rand(0.5, 1.2),
            life: 1, decay: 0.02, size: rand(9, 13),
            heart: true, vr: rand(-0.05, 0.05),
          })
        }
      }

      for (let i = fx.ps.length - 1; i >= 0; i--) {
        const p = fx.ps[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= p.decay
        if (p.life <= 0) { fx.ps.splice(i, 1); continue }
        const a = Math.max(0, Math.min(1, p.life))

        if (p.heart) {
          p.rot += p.vr
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.font = `${p.size}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `rgba(255,70,160,${a})`
          ctx.shadowColor = 'rgba(255,70,160,.9)'
          ctx.shadowBlur = 8
          ctx.fillText('♥', 0, 0)
          ctx.restore()
        } else {
          const r = p.size / 3
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3)
          g.addColorStop(0, `rgba(255,255,255,${a})`)
          g.addColorStop(0.3, `rgba(255,105,200,${a * 0.8})`)
          g.addColorStop(1, 'rgba(255,105,200,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  /* ---- the pen: follows the wipe of the current word ---- */
  useEffect(() => {
    if (phase !== 'writing') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done')
      return
    }

    const words = bodyRef.current.querySelectorAll('.w')
    const { starts, durs, count, end } = model
    const em = parseFloat(getComputedStyle(words[0]).fontSize) || 22
    const t0 = performance.now()
    let cur = -1
    let follow = true
    let raf

    const stop = () => { follow = false } // she scrolls = stop following
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)

    const loop = (now) => {
      const el = now - t0
      while (cur + 1 < count && starts[cur + 1] <= el) cur++

      if (cur >= 0) {
        const r = words[cur].getBoundingClientRect()
        const p = Math.min(1, (el - starts[cur]) / durs[cur])
        const tx = r.left + p * (r.width + em)
        const ty = r.top + r.height * 0.72

        if (!fx.tip) fx.tip = { x: tx, y: ty }
        else {
          fx.tip.x += (tx - fx.tip.x) * 0.6   // glides back to the next line
          fx.tip.y += (ty - fx.tip.y) * 0.35
        }

        if (follow) {
          const d = fx.tip.y - window.innerHeight * 0.6
          if (d > 0) window.scrollBy(0, d * 0.08 + 0.4)
        }
      }

      if (el > end + 1000) {
        fx.tip = null
        setPhase('done')
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      fx.tip = null
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [phase, run, model])

  const skip = () => { fx.tip = null; setPhase('done') }

  const replay = () => {
    setRun((r) => r + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setPhase('writing')
  }

  return (
    <div className="page page5">
      <canvas ref={canvasRef} className="fx" />

      <div className={`sheet ${phase === 'done' ? 'done' : ''}`}>
        <div className="shadow-wrap">
          <div className="shadow-shape" style={{ clipPath: outer, WebkitClipPath: outer }} />
        </div>

        <div className="paper" style={{ clipPath: outer, WebkitClipPath: outer }}>
          <div
            className="paper-body"
            key={run}
            ref={bodyRef}
            style={{ clipPath: inner, WebkitClipPath: inner }}
          >
            {model.blocks.map((b, bi) => {
              const Tag = b.kind === 'title' ? 'h1' : 'p'
              return (
                <Tag key={bi} className={b.kind === 'title' ? 'letter-title' : 'letter-p'}>
                  {b.words.map((w, wi) =>
                    w.br ? (
                      <br key={wi} />
                    ) : (
                      <Fragment key={wi}>
                        <span
                          className="w"
                          style={{
                            '--d': `${model.starts[w.i]}ms`,
                            '--dur': `${model.durs[w.i]}ms`,
                          }}
                        >
                          {w.t}
                        </span>{' '}
                      </Fragment>
                    )
                  )}
                </Tag>
              )
            })}
          </div>
        </div>
      </div>

      <Dots total={4} current={3} />
    </div>
  )
}

export default Page5