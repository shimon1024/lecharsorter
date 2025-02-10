import { useState } from 'react'
import './App.css'
//import Setup from './Setup.jsx'
//import Compare from './Compare.jsx'
import Result from './Result.jsx'

export default function App() {
  return (
    <>
      {/*<Setup />*/}
      {/*<Compare sorterTitle="すき" />*/}
      <Result sorterTitle="すき" chars={Array(40).fill('キャラ').map((c, i) => `${c}${i+1}`)} />
      <footer className="footer">開発: <a href="https://postfixnotation.org/" target="_blank">志文</a></footer>
    </>
  )
}
