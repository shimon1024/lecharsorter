import './App.css';
import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Setup from './Setup.jsx';

export default function App() {
  return (
    <>
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
      <footer className="footer">
        <span>開発: <a href="https://postfixnotation.org/" target="_blank">志文</a></span>
        <span>このプログラムは非公式です。</span>
      </footer>
    </>
  )
}
