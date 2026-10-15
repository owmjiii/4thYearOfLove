import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClosedEnvelope from '../images/Closed Envelope.png'

function Page1() {
  const navigate = useNavigate()
  const [opening, setOpening] = useState(false)

  const open = () => {
    if (opening) return
    setOpening(true)
    setTimeout(() => navigate('/letter'), 700) // match the shake animation
  }

  return (
    <div className={`page ${opening ? 'leaving' : ''}`}>
      <h1 className="title">A special letter just for my k</h1>
      <img className="env-img" src={ClosedEnvelope} alt="Closed envelope" onClick={open} />
      <button className="button" onClick={open}>Tap to Open</button>
    </div>
  )
}

export default Page1