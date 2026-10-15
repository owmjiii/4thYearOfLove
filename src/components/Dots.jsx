import { useNavigate } from 'react-router-dom'

const PAGE_PATHS = ['/letter', '/page3', '/page4', '/page5']

export default function Dots({ total = 4, current = 0 }) {
  const navigate = useNavigate()

  return (
    <nav className="dots" aria-label="Page navigation">
      {Array.from({ length: total }, (_, i) => {
        const className = i === current ? 'dot on' : 'dot'
        const label = `Page ${i + 1}`

        return i < current && PAGE_PATHS[i]
          ? (
              <button
                key={i}
                type="button"
                className={`${className} dot-button`}
                onClick={() => navigate(PAGE_PATHS[i])}
                aria-label={`Go back to ${label}`}
                title={`Go back to ${label}`}
              />
            )
          : (
              <span
                key={i}
                className={className}
                aria-current={i === current ? 'step' : undefined}
                aria-label={i === current ? label : undefined}
                aria-hidden={i > current ? 'true' : undefined}
              />
            )
      })}
    </nav>
  )
}