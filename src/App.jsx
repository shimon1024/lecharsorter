import { useState } from 'react'
import './App.css'
import Setup from './Setup.jsx'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Setup />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}
