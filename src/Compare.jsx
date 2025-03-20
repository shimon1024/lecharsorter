import { useContext, useState } from 'react';
import Result from './Result.jsx';
import './Compare.css';
import { SceneSetContext } from './SceneContext.jsx';
import * as le from './lenen.js'
import * as sorter from './sorter.js';

export default function Compare({ charIdSet, numRanks, sorterTitle, randSeed }) {
  const [sortHistory, setSortHistory] = useState(() => sorter.newSortHistory({ charIdSet, numRanks, randSeed }));
  const setScene = useContext(SceneSetContext);

  const { heaptree, ai, bi, aj, bj, sortState, ranking } = sortHistory.steps[sortHistory.currentStep];
  const aId = heaptree[ai][aj];
  const bId = heaptree[bi][bj];

  function handleClick(action) {
    const newSortHistory = sorter.reduceSortHistory(sortHistory, action);
    setSortHistory(newSortHistory);
    const newStep = newSortHistory.steps[newSortHistory.currentStep];
    // TODO minutes, nCompares
    // TODO endやっぱよくないかも。他の多くの値が無効なので。やっぱ終了フラグがいいかな。
    if (newStep.sortState === 'end') {
      setScene(
        <Result
          sorterTitle={sorterTitle}
          chars={newStep.ranking}
          minutes={null}
          nCompares={null}
        />
      );
    }
  }

  return (
    <div className="compare">
      <h1 className="compare-title">どっちが{sorterTitle}？</h1>
      <div className="compare-main">
        <button
          className="compare-char1"
          onClick={() => {handleClick({ type: 'compare', result: 'a' })}}
        >
          {le.chars[aId].name}
        </button>
        <button
          className="compare-char2"
          onClick={() => {handleClick({ type: 'compare', result: 'b' })}}
        >
          {le.chars[bId].name}
        </button>
      </div>
      <button
        className="compare-both"
        onClick={() => {handleClick({ type: 'compare', result: 'both' })}}
      >
        どちらも
      </button>
      <hr className="compare-hr-main-sub" />
      <button
        className="compare-undo"
        onClick={() => {handleClick({ type: 'undo' })}}
      >
        ↶
      </button>
      <button
        className="compare-redo"
        onClick={() => {handleClick({type: 'redo'})}}
      >
        ↷
      </button>
      <div className="compare-info">(n組目、n%完了、残り最大n組)</div>
      <button className="compare-quit">キャラソートをやめる</button>
    </div>
  );
}
