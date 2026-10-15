import { useEffect, useState } from 'react'
import BGVid from '../images/BGVid.mp4'
import ClosedEnvelope from '../images/Closed Envelope.png'
import Daylight from '../images/Daylight.mp3'
import DaylightCover from '../images/Daylightcover.png'
import GlowHeart from '../images/Glow Heart.png'
import OpenEnvelope from '../images/Open Envelope.png'

const PHOTO_ASSETS = Object.entries({
  ...import.meta.glob('../images/hero.*', {
    eager: true,
    import: 'default',
  }),
  ...import.meta.glob('../images/photos/*.jpg', {
    eager: true,
    import: 'default',
  }),
}).map(([path, url]) => ({
  label: path.split('/').pop(),
  url,
  type: 'image',
}))

const ASSETS = [
  ...PHOTO_ASSETS,
  { label: 'closed envelope', url: ClosedEnvelope, type: 'image' },
  { label: 'open envelope', url: OpenEnvelope, type: 'image' },
  { label: 'music cover', url: DaylightCover, type: 'image' },
  { label: 'heart background', url: GlowHeart, type: 'image' },
  { label: 'background video', url: BGVid, type: 'video' },
  { label: 'song', url: Daylight, type: 'audio' },
]

const LILIES = Array.from({ length: 16 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  size: `${30 + ((index * 19) % 38)}px`,
  duration: `${8 + ((index * 7) % 8)}s`,
  delay: `${-((index * 13) % 16)}s`,
  sway: `${-35 + ((index * 23) % 70)}px`,
}))

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Image failed to load'))
    image.src = url
    if (image.complete) {
      if (image.naturalWidth > 0) resolve()
      else reject(new Error('Image failed to load'))
    }
  })
}

function loadMedia(url, type) {
  return new Promise((resolve, reject) => {
    const media = document.createElement(type)
    media.preload = 'auto'
    if (type === 'video') media.muted = true

    const finish = (error) => {
      media.oncanplay = null
      media.onerror = null
      media.removeAttribute('src')
      media.load()
      if (error) reject(error)
      else resolve()
    }

    media.oncanplay = () => finish()
    media.onerror = () => finish(new Error(`${type} failed to load`))
    media.src = url
    media.load()
  })
}

export default function LoadingScreen({ onReady }) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [failures, setFailures] = useState([])
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    let active = true
    let finishTimeout
    const startedAt = performance.now()

    const tasks = ASSETS.map((asset) => ({
      ...asset,
      promise: asset.type === 'image'
        ? loadImage(asset.url)
        : loadMedia(asset.url, asset.type),
    }))

    const results = tasks.map(({ promise }) => promise.then(
      () => {
        if (active) setLoaded((count) => count + 1)
        return null
      },
      (error) => {
        if (active) setLoaded((count) => count + 1)
        return error
      }
    ))

    Promise.all(results).then((errors) => {
      if (!active) return
      const failedAssets = tasks
        .filter((_, index) => errors[index])
        .map((asset) => asset.label)

      if (failedAssets.length) {
        setFailures(failedAssets)
        return
      }

      setFinishing(true)
      const wait = Math.max(350, 700 - (performance.now() - startedAt))
      finishTimeout = window.setTimeout(() => {
        if (active) onReady()
      }, wait)
    })

    return () => {
      active = false
      window.clearTimeout(finishTimeout)
    }
  }, [attempt, onReady])

  const progress = Math.round((loaded / ASSETS.length) * 100)

  return (
    <main className={`loading-screen${finishing ? ' is-finishing' : ''}`}>
      <div className="lily-shower" aria-hidden="true">
        {LILIES.map((lily, index) => (
          <svg
            key={index}
            className="shower-lily"
            viewBox="0 0 80 120"
            style={{
              '--lily-left': lily.left,
              '--lily-size': lily.size,
              '--lily-duration': lily.duration,
              '--lily-delay': lily.delay,
              '--lily-sway': lily.sway,
            }}
          >
            <path className="lily-stem" d="M40 45 C39 72 44 93 39 119" />
            <path className="lily-leaf" d="M40 86 C20 75 12 83 15 91 C23 96 32 93 40 86Z" />
            <path className="lily-leaf" d="M41 101 C55 87 67 91 65 99 C59 106 50 106 41 101Z" />
            <path className="lily-petal" d="M40 46 C27 36 29 15 40 4 C51 15 53 36 40 46Z" />
            <path className="lily-petal petal-left" d="M38 46 C22 43 11 27 16 14 C30 20 39 32 38 46Z" />
            <path className="lily-petal petal-right" d="M42 46 C58 43 69 27 64 14 C50 20 41 32 42 46Z" />
            <path className="lily-petal petal-low-left" d="M39 47 C23 51 12 43 11 33 C26 34 36 38 39 47Z" />
            <path className="lily-petal petal-low-right" d="M41 47 C57 51 68 43 69 33 C54 34 44 38 41 47Z" />
            <circle className="lily-center" cx="40" cy="43" r="3" />
          </svg>
        ))}
      </div>
      <div className="loading-content">
        <h1>Oh so you saw it ha, prepare to be amazed :D</h1>
        <p>
          {failures.length
            ? 'Bruhh, Retry mo'
            : 'Are you ready lolove?'}
        </p>

        <div
          className="loading-track"
          role="progressbar"
          aria-label="Loading photos, video, and music"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="loading-count">{progress}%</span>

        {failures.length > 0 && (
          <>
            <p className="loading-error">
              Could not load: {failures.join(', ')}
            </p>
            <button
              className="button loading-retry"
              onClick={() => {
                setLoaded(0)
                setFailures([])
                setFinishing(false)
                setAttempt((n) => n + 1)
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </main>
  )
}
