import { useState, useEffect } from 'react';
import './App.css';
import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.js';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import Result from './Result.jsx';
import ErrorPage, { messageOpenViewMode } from './ErrorPage.jsx';
import * as save from './save.js';
import * as serialize from './serialize.js';

export default function App() {
  const [initialScene, setInitialScene] = useState(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const cmd = params.get('c');
      if (cmd === 'v') {
        try {
          const { sorterTitle, ranking, unranked } = serialize.deserializeResultData(params);

          setInitialScene(
            <Result
              sorterTitle={sorterTitle}
              ranking={ranking}
              unranked={unranked}
              mode="view"
            />
          );
        } catch (e) {
          console.error(`App: view mode error: ${e}`);
          setInitialScene(<ErrorPage message={messageOpenViewMode} />);
        }

        return;
      }

      const [sorterTitle, sortHistory] = await save.loadSaveData().catch(() => []);
      if (sorterTitle != null && sortHistory != null &&
          confirm('保存されたセーブデータが見つかりました。開きますか？')) {
        if (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
          setInitialScene(
            <Compare
              sorterTitle={sorterTitle}
              initialSortHistory={sortHistory}
              initialAutosaveIsEnabled={true}
            />
          );
        } else {
          const step = sortHistory.steps[sortHistory.currentStep];
          setInitialScene(
            <Result
              sorterTitle={sorterTitle}
              ranking={step.ranking}
              unranked={step.heaptree.flat().toSorted((a, b) => a - b)}
              nCompares={sortHistory.currentStep}
            />
          );
        }
      } else {
        setInitialScene(<Setup />);
      }
    })();
  }, []);

  return initialScene === null ? <></> : (
    <>
      <SceneProvider defaultScene={initialScene}>
        <Scene />
      </SceneProvider>
      <footer className="footer">
        <span>開発: <a href="https://postfixnotation.org/" target="_blank">志文</a></span>
        <span>このプログラムは非公式です。</span>
      </footer>
    </>
  );
}
