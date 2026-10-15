import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'

const PIN = '1017'          // ← change this (can include "." too, e.g. '4.12')
const CLUE = 'Bio'          // ← change the clue text
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL']

export default function PinPage() {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [result, setResult] = useState(null) // null | 'ok' | 'wrong'

    const press = (k) => {
        if (result) return
        if (k === 'DEL') setCode((c) => c.slice(0, -1))
        else setCode((c) => (c.length < PIN.length ? c + k : c))
    }

    // auto-check when all boxes are filled
    useEffect(() => {
        if (code.length !== PIN.length) return
        const id = setTimeout(() => setResult(code === PIN ? 'ok' : 'wrong'), 250)
        return () => clearTimeout(id)
    }, [code])

    // keyboard support for desktop
    useEffect(() => {
        const onKey = (e) => {
            if (/^[0-9.]$/.test(e.key)) press(e.key)
            else if (e.key === 'Backspace') press('DEL')
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [result])

    const handleModal = () => {
        if (result === 'ok') {
            sessionStorage.setItem('unlocked', '1')
            navigate('/envelope')
        } else {
            setCode('')
            setResult(null)
        }
    }

    return (
        <div className="page page-enter">
            <h1 className="pin-title">Enter Code</h1>

            <div className="pin-boxes">
                {Array.from({ length: PIN.length }, (_, i) => (
                    <div key={i} className="pin-box">{code[i] ?? ''}</div>
                ))}
            </div>

            <p className="pin-clue">Clue: {CLUE}</p>

            <div className="keypad">
                {KEYS.map((k) => (
                    <button
                        key={k}
                        className={`key ${k === 'DEL' ? 'del' : ''}`}
                        onClick={() => press(k)}
                    >
                        {k}
                    </button>
                ))}
            </div>

            {result &&
                createPortal(
                    <div className="modal-backdrop">
                        <div className="modal">
                            <p>
                                {result === 'ok'
                                    ? 'Eyy! Tama ka nyehehe'
                                    : 'Aray ko po! Wrong Password'}
                            </p>
                            <button className="button" onClick={handleModal}>
                                {result === 'ok' ? 'Next' : 'Try Again'}
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    )
}