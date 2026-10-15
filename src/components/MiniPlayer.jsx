import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FaPlay, FaPause } from 'react-icons/fa'
import { IoShuffle, IoPlaySkipBack, IoPlaySkipForward, IoRepeat, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { useMusic } from './MusicProvider.jsx'

const HIDDEN_ON = ['/', '/envelope', '/letter', '/page3']

export default function MiniPlayer() {
  const { pathname } = useLocation()
  const { playing, time, duration, repeat, toggle, seek, restart, toggleRepeat } = useMusic()
  const [shuffle, setShuffle] = useState(false)
  const [minimized, setMinimized] = useState(false)

  if (HIDDEN_ON.includes(pathname)) return null

  const pct = duration ? (time / duration) * 100 : 0

  return (
    <div className={`mini-player${minimized ? ' minimized' : ''}`}>
      <div className="mini-player-top">
        <span className="mini-player-label">Daylight</span>
        <button
          className="mini-player-toggle"
          onClick={() => setMinimized((value) => !value)}
          aria-label={minimized ? 'Maximize music player' : 'Minimize music player'}
          aria-expanded={!minimized}
        >
          {minimized ? <IoChevronDown /> : <IoChevronUp />}
        </button>
      </div>
      {!minimized && (
        <>
          <input
            className="seek"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={time}
            onChange={(e) => seek(e.target.value)}
            style={{ '--pct': `${pct}%` }}
            aria-label="Seek"
          />
          <div className="mini-controls">
            <button className={`icon-btn ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle">
              <IoShuffle />
            </button>
            <button className="icon-btn" onClick={restart} aria-label="Previous">
              <IoPlaySkipBack />
            </button>
            <button className="circle-btn big" onClick={toggle} aria-label="Play or pause">
              {playing ? <FaPause /> : <FaPlay style={{ marginLeft: 2 }} />}
            </button>
            <button className="icon-btn" onClick={restart} aria-label="Next">
              <IoPlaySkipForward />
            </button>
            <button className={`icon-btn ${repeat ? 'active' : ''}`} onClick={toggleRepeat} aria-label="Repeat">
              <IoRepeat />
            </button>
          </div>
        </>
      )}
      {minimized && (
        <button className="circle-btn big mini-player-play" onClick={toggle} aria-label="Play or pause">
          {playing ? <FaPause /> : <FaPlay style={{ marginLeft: 2 }} />}
        </button>
      )}
    </div>
  )
}