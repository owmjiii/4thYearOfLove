import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa'
import { IoShuffle, IoPlaySkipBack, IoPlaySkipForward, IoRepeat } from 'react-icons/io5'
import Dots from '../components/Dots.jsx'
import { useMusic } from '../components/MusicProvider.jsx'
import { useBackgroundVideo } from '../components/BackgroundVideo.jsx'
import DaylightCover from '../images/Daylightcover.png'

const TEXT = 'I always love listening to this song because it reminds me of us '
const BASE = TEXT.slice(0, -1)

const SONG = {
  title: 'Daylight',
  artist: 'Taylor Swift',
  cover: DaylightCover,
}

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function Page3() {
  const navigate = useNavigate()
  const { play: playBackgroundVideo, stop: stopBackgroundVideo } = useBackgroundVideo()
  const { playing, time, duration, repeat, toggle, seek, restart, toggleRepeat } = useMusic()

  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [shuffle, setShuffle] = useState(false)

  useEffect(() => {
    playBackgroundVideo()
    return stopBackgroundVideo
  }, [playBackgroundVideo, stopBackgroundVideo])

  // typewriter
  useEffect(() => {
    let id
    const start = setTimeout(() => {
      let i = 0
      id = setInterval(() => {
        i++
        setCount(i)
        if (i >= TEXT.length) clearInterval(id)
      }, 60)
    }, 600)
    return () => { clearTimeout(start); clearInterval(id) }
  }, [])

  const typedBase = BASE.slice(0, count)
  const ghostBase = BASE.slice(count)
  const uShown = count >= TEXT.length
  const pct = duration ? (time / duration) * 100 : 0

  return (
    <>
      <div className="page page-enter">
        <p className="song-msg">
          <span className="typed-glow">{typedBase}</span>
          <span className="ghost">{ghostBase}{!uShown && 'u'}</span>
        </p>

        <div className="player">
          <div className="track">
            <img className="cover" src={SONG.cover} alt="" />
            <div className="track-info">
              <strong>{SONG.title}</strong>
              <span>{SONG.artist}</span>
            </div>
            <button className="icon-btn like" onClick={() => setLiked(!liked)} aria-label="Like">
              {liked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

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
          <div className="times">
            <span>{fmt(time)}</span>
            <span>{fmt(duration)}</span>
          </div>

          <div className="controls">
            <button className={`icon-btn ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle">
              <IoShuffle />
            </button>
            <button className="circle-btn small" onClick={restart} aria-label="Previous">
              <IoPlaySkipBack />
            </button>
            <button className="circle-btn big" onClick={toggle} aria-label="Play or pause">
              {playing ? <FaPause /> : <FaPlay style={{ marginLeft: 4 }} />}
            </button>
            <button className="circle-btn small" onClick={restart} aria-label="Next">
              <IoPlaySkipForward />
            </button>
            <button className={`icon-btn ${repeat ? 'active' : ''}`} onClick={toggleRepeat} aria-label="Repeat">
              <IoRepeat />
            </button>
          </div>
        </div>

        <button className="button" onClick={() => navigate('/page4')}>Next</button>
        <Dots total={4} current={1} />
      </div>
    </>
  )
}

export default Page3