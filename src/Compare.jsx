import { useReducer, useContext } from 'react';
import Result from './Result.jsx';
import './Compare.css';
import { SceneSetContext } from './SceneContext.jsx';
import * as le from './lenen.js'
import * as sorter from './sorter.js';

export default function Compare({ charIdSet, numRanks, sorterTitle, randSeed }) {
  const [sortHistory, dispatchSortHistory] = useReducer(
    sorter.reduceSortHistory,
    { charIdSet, numRanks, randSeed },
    sorter.newSortHistory
  );
  const setScene = useContext(SceneSetContext);

  const { heaptree, ai, bi, aj, bj, sortState } = sortHistory.steps[sortHistory.currentStep];
  const aId = heaptree[ai][aj];
  const bId = heaptree[bi][bj];

  // TODO minutes, nCompares
  if (sortState === 'end') {
    setScene(
      <Result
        sorterTitle={sorterTitle}
        chars={heaptree}
        minutes={null}
        nCompares={null}
      />
    );
  }

  return (
    <div className="compare">
      <h1 className="compare-title">どっちが{sorterTitle}？</h1>
      <div className="compare-main">
        <button
          className="compare-char1"
          onClick={() => {dispatchSortHistory({type: 'compare', result: 'a'})}}
        >
          {le.chars[aId].name}
        </button>
        <button
          className="compare-char2"
          onClick={() => {dispatchSortHistory({type: 'compare', result: 'b'})}}
        >
          {le.chars[bId].name}
        </button>
        <button
          className="compare-both"
          onClick={() => {dispatchSortHistory({type: 'compare', result: 'both'})}}
        >
          両方
        </button>
        <button
          className="compare-skip"
          onClick={() => {dispatchSortHistory({type: 'compare', result: 'skip'})}}
        >
          あとまわし
        </button>
      </div>
      <hr className="compare-hr-main-sub" />
      <button className="compare-undo">↶</button>
      <button className="compare-redo">↷</button>
      <div className="compare-info">(n組目、n%完了、残り最大n組)</div>
      <button className="compare-quit">キャラソートをやめる</button>
    </div>
  );
}
