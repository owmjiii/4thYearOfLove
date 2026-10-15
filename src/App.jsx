import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { BackgroundVideoProvider } from './components/BackgroundVideo.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import PinPage from './pages/PinPage.jsx'
import Page1 from './pages/Page1.jsx'
import Page2 from './pages/Page2.jsx'
import Page3 from './pages/Page3.jsx'
import Page4 from './pages/Page4.jsx'
import Page5 from './pages/Page5.jsx'
import RequireUnlock from './components/RequireUnlock.jsx'
import ParticleBackground from './components/ParticleBackground.jsx'
import HeartBeat from './components/HeartBeat.jsx'
import MiniPlayer from './components/MiniPlayer.jsx'
import { MusicProvider } from './components/MusicProvider.jsx'

function App() {
  const [ready, setReady] = useState(false)

  if (!ready) return <LoadingScreen onReady={() => setReady(true)} />

  return (
    <BackgroundVideoProvider>
      <MusicProvider>
        <HeartBeat />
        <ParticleBackground />
        <MiniPlayer />
        <Routes>
          <Route path="/" element={<PinPage />} />

          <Route element={<RequireUnlock />}>
            <Route path="/envelope" element={<Page1 />} />
            <Route path="/letter" element={<Page2 />} />
            <Route path="/page3" element={<Page3 />} />
            <Route path="/page4" element={<Page4 />} />
            <Route path="/page5" element={<Page5 />} />
          </Route>
        </Routes>
      </MusicProvider>
    </BackgroundVideoProvider>
  )
}

export default App