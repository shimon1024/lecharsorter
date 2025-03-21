import { useContext, useState } from 'react';
import Result from './Result.jsx';
import './Compare.css';
import { SceneSetContext } from './SceneContext.jsx';
import * as le from './lenen.js'
import * as sorter from './sorter.js';

function calcProgress(sortHistory, numRanks) {
  // ゴールがヒープ木が空になるかランキングが必要分集まるかの2種類あって、どちらかを達成すればいいと考える。
  // 2種類のゴールそれぞれについて進捗を計算し、より進みが大きい方を返す。
  //
  // 例えば、ランキングの制限が緩い(全キャラソートかつ全キャラ選出など)条件で、heapifyを終えた後にextractで
  // ずっとマージし続けた場合、ランキングの観点で見ると進捗が無いが、ヒープ木の観点で見るとノードが減り続けるため、
  // 全体では進捗があると言える。
  //
  // 逆に、ランキングの制限が厳しい(全キャラソートかつ3位までなど)条件で、heapifyを終えた後にextractでマージせずに
  // 選択を続けた場合、ヒープ木の観点では進捗が少ないが、ランキングの観点で見るとランキング制限に対して順調にノードが増えるため、
  // 全体では進捗があると言える。

  const denoHeapify = sortHistory.steps[0].start;
  const denoExtractNumNodes = sortHistory.steps[0].heaptree.length;
  const denoExtractNumRanks = numRanks;
  const numeHeapify = denoHeapify - sortHistory.steps[sortHistory.currentStep].start;
  const numeExtractNumNodes = denoExtractNumNodes - sortHistory.steps[sortHistory.currentStep].heaptree.length;
  const numeExtractNumRanks = sortHistory.steps[sortHistory.currentStep].ranking.length;

  return Math.max(
    (numeHeapify + numeExtractNumNodes) / (denoHeapify + denoExtractNumNodes),
    (numeHeapify + numeExtractNumRanks) / (denoHeapify + denoExtractNumRanks),
  );
}

export default function Compare({ charIdSet, numRanks, sorterTitle, randSeed }) {
  const [sortHistory, setSortHistory] = useState(() => sorter.newSortHistory({ charIdSet, numRanks, randSeed }));
  const setScene = useContext(SceneSetContext);

  const { heaptree, ai, bi, aj, bj, sortState, ranking } = sortHistory.steps[sortHistory.currentStep];
  const aId = heaptree[ai][aj];
  const bId = heaptree[bi][bj];
  const progressPercent = Math.floor(calcProgress(sortHistory, numRanks) * 100);

  function handleClick(action) {
    const newSortHistory = sorter.reduceSortHistory(sortHistory, action);
    setSortHistory(newSortHistory);
    const newStep = newSortHistory.steps[newSortHistory.currentStep];
    // TODO 自動保存。IndexedDB?redo後の選択に伴う履歴の廃棄に対応することを忘れずに。

    if (newStep.sortState === 'end') {
      setScene(
        <Result
          sorterTitle={sorterTitle}
          chars={newStep.ranking}
          nCompares={newSortHistory.currentStep}
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
      <div className="compare-info">({sortHistory.currentStep + 1}組目、{progressPercent}%完了)</div>
      <button className="compare-quit">キャラソートをやめる</button>
    </div>
  );
}
