import { useContext, useState } from 'react';
import Setup from './Setup.jsx';
import Result from './Result.jsx';
import ErrorPage, { messageClearSaveData } from './ErrorPage.jsx';
import './Compare.css';
import { SceneSetContext } from './SceneContext.jsx';
import * as le from './lenen.js'
import * as sorter from './sorter.js';
import * as save from './save.js';

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

// 通常起こらないが、initialSortHistory.steps.at(-1).sortStateが'end'のときに呼び出した場合、表示されるキャラは空白になり、
// いずれかの比較ボタンを押すと結果画面が表示される。
export default function Compare({ sorterTitle, initialSortHistory, initialAutosaveIsEnabled }) {
  const [sortHistory, setSortHistory] = useState(initialSortHistory);
  const [autosaveIsEnabled, setAutosaveIsEnabled] = useState(initialAutosaveIsEnabled);
  const setScene = useContext(SceneSetContext);

  const { heaptree, ai, bi, aj, bj, sortState, ranking } = sortHistory.steps[sortHistory.currentStep];
  const progressPercent = Math.floor(calcProgress(sortHistory, sortHistory.numRanks) * 100);

  async function handleClick(action) {
    const newSortHistory = sorter.reduceSortHistory(sortHistory, action);
    setSortHistory(newSortHistory);
    const newStep = newSortHistory.steps[newSortHistory.currentStep];

    if (autosaveIsEnabled) {
      try {
        await save.saveSaveData(sorterTitle, newSortHistory, action.type);
      } catch (e) {
        console.error(`Compare: handleClick: autosave error: ${e}`);
        setAutosaveIsEnabled(false);
      }
    }

    if (newStep.sortState === 'end') {
      setScene(
        <Result
          sorterTitle={sorterTitle}
          ranking={newStep.ranking}
          unranked={newStep.heaptree.flat().toSorted((a, b) => a - b)}
          nCompares={newSortHistory.currentStep}
        />
      );
    }
  }

  async function handleRetryClick() {
    if (!confirm('キャラソートの保存された途中経過は破棄されます。キャラソートをやめますか？')) {
      return;
    }

    try {
      await save.clearSaveData();
    } catch (e) {
      console.error(`Compare: handleRetryClick: clear save error: ${e}`);
      setScene(<ErrorPage message={messageClearSaveData} />);
      return;
    }

    setScene(<Setup />);
  }

  return (
    <div className="compare">
      <h1 className="compare-title">どっちが{sorterTitle}？</h1>
      <div className="compare-main">
        <button
          className="compare-char1"
          data-testid="compare-char1"
          onClick={async () => handleClick({ type: 'compare', result: 'a' })}
        >
          {sortState !== 'end' && le.chars[heaptree[ai][aj]].name}
        </button>
        <button
          className="compare-char2"
          data-testid="compare-char2"
          onClick={async () => handleClick({ type: 'compare', result: 'b' })}
        >
          {sortState !== 'end' && le.chars[heaptree[bi][bj]].name}
        </button>
      </div>
      <button
        className="compare-both"
        onClick={async () => handleClick({ type: 'compare', result: 'both' })}
      >
        どちらも
      </button>
      <hr className="compare-hr-main-sub" />
      <button
        className="compare-undo"
        disabled={sortHistory.currentStep === 0}
        onClick={async () => handleClick({ type: 'undo' })}
      >
        ←
      </button>
      <button
        className="compare-redo"
        disabled={sortHistory.currentStep === sortHistory.steps.length - 1}
        onClick={async () => handleClick({ type: 'redo' })}
      >
        →
      </button>
      <div className="compare-info">{`(${sortHistory.currentStep + 1}組目、${progressPercent}%完了)`}</div>
      <div className="compare-autosave">{!autosaveIsEnabled && '進行状態の自動保存に失敗しました。自動保存機能を無効にしてキャラソートを続行します。'}</div>
      <button
        className="compare-quit"
        onClick={handleRetryClick}
      >
        キャラソートをやめる
      </button>
    </div>
  );
}
