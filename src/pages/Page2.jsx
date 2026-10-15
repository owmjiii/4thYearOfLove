import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OpenEnvelope from '../images/Open Envelope.png'
import Dots from '../components/Dots.jsx'
import { useBackgroundVideo } from '../components/BackgroundVideo.jsx'

const SEGMENTS = [
  { text: 'Happy 4 Years of Us', cls: 'm-small' },
  { text: 'Loveee!', cls: 'm-big' },
  { text: 'Having us is one of', cls: 'm-body' },
  { text: 'the greatest gifts', cls: 'm-body' },
  { text: 'of my existence.', cls: 'm-body' },
]
const TOTAL = SEGMENTS.reduce((n, s) => n + s.text.length, 0)

function useTypewriter(total, speed = 55, startDelay = 900) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0, id
    const start = setTimeout(() => {
      id = setInterval(() => {
        i++
        setCount(i)
        if (i >= total) clearInterval(id)
      }, speed)
    }, startDelay)
    return () => { clearTimeout(start); clearInterval(id) }
  }, [total, speed, startDelay])
  return count
}

function Page2() {
  const navigate = useNavigate()
  const { play: playBackgroundVideo } = useBackgroundVideo()
  const count = useTypewriter(TOTAL)
  const done = count >= TOTAL
  const openNextPage = () => {
    playBackgroundVideo()
    navigate('/page3')
  }

  let remaining = count
  let caretPlaced = false

  return (
    <div className="page page-enter">
      <div className={`env-stage ${done ? 'done' : 'writing'}`}>
        <span className="env-glow" />
        <img className="env-img-open" src={OpenEnvelope} alt="" />

        <div className="message">
          {SEGMENTS.map((seg, i) => {
            const n = Math.max(0, Math.min(seg.text.length, remaining))
            remaining -= seg.text.length
            const showCaret = !done && !caretPlaced && n < seg.text.length
            if (showCaret) caretPlaced = true

            return (
              <p key={i} className={seg.cls}>
                <span className="typed">{seg.text.slice(0, n)}</span>
                {showCaret && <span className="caret" />}
                <span className="ghost">{seg.text.slice(n)}</span>
              </p>
            )
          })}
        </div>

      </div>

      <button
        className={`button ${done ? '' : 'hidden'}`}
        onClick={openNextPage}
      >
        Next
      </button>

      <Dots total={4} current={0} />
    </div>
  )
}

export default Page2