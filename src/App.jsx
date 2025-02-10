import { useState } from 'react'
import './App.css'
//import Setup from './Setup.jsx'
import Compare from './Compare.jsx'
//import Result from './Result.jsx'

export default function App() {
  return (
    <>
      <Compare sorterTitle="すき" />
      <footer className="footer">開発: <a href="https://postfixnotation.org/">志文</a></footer>
    </>
  )
}
