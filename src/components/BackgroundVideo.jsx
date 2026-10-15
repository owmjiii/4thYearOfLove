import { createContext, useCallback, useContext, useRef, useState } from 'react'
import BGVid from '../images/BGVid.mp4'

const BackgroundVideoContext = createContext(null)

export function useBackgroundVideo() {
  return useContext(BackgroundVideoContext)
}

export function BackgroundVideoProvider({ children }) {
  const videoRef = useRef(null)
  const [visible, setVisible] = useState(false)

  const play = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setVisible(true)
    if (video.paused) {
      video.play().catch((error) => {
        console.error('Background video playback failed:', error)
      })
    }
  }, [])

  const stop = useCallback(() => {
    videoRef.current?.pause()
    setVisible(false)
  }, [])

  return (
    <BackgroundVideoContext.Provider value={{ play, stop }}>
      <video
        ref={videoRef}
        className={`bg-video${visible ? ' is-visible' : ''}`}
        src={BGVid}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className={`video-tint${visible ? ' is-visible' : ''}`} />
      {children}
    </BackgroundVideoContext.Provider>
  )
}
