import { createContext, useContext, useRef, useState } from 'react'
import Daylight from '../images/Daylight.mp3'

const MusicContext = createContext(null)
export const useMusic = () => useContext(MusicContext)

export function MusicProvider({ children, src = Daylight }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeat, setRepeat] = useState(false)

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }
  const seek = (t) => { if (audioRef.current) audioRef.current.currentTime = Number(t) }
  const restart = () => seek(0)
  const toggleRepeat = () => setRepeat((r) => !r)

  return (
    <MusicContext.Provider
      value={{ playing, time, duration, repeat, toggle, seek, restart, toggleRepeat }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        loop={repeat}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setTime(e.target.currentTime)}
      />
      {children}
    </MusicContext.Provider>
  )
}