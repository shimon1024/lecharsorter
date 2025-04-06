import { useState, useContext } from 'react';
import './Setup.css';
import { SceneSetContext } from './SceneContext.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';
import * as random from './random.js';
import * as save from './save.js';
import * as sorter from './sorter.js';

function WorkGroup({ onWorkChange, onCharChange, charIdSet, workId }) {
  return (
    <ul className="workgroup-tree">
      <li>
        <details className="workgroup-details">
          <summary className="workgroup-summary">
            <label>
              <input
                type="checkbox"
                checked={charIdSet.isSupersetOf(new Set(le.works[workId].chars))}
                onChange={e => onWorkChange(workId, e.target.checked)}
              />
              {le.works[workId].name}
            </label>
          </summary>
          <ul>
            {
              le.works[workId].chars.map(c =>
                <li key={c}>
                  <label className="workgroup-char">
                    <input
                      type="checkbox"
                      checked={charIdSet.has(c)}
                      onChange={e => onCharChange(c, e.target.checked)}
                    />
                    {le.chars[c].name}
                  </label>
                </li>
              )
            }
          </ul>
        </details>
      </li>
    </ul>
  );
}

export default function Setup() {
  const [sorterTitle, setSorterTitle] = useState('すき');
  const [charIdSet, setCharIdSet] = useState(new Set(le.charIdsDefault));
  const [numRanks, setNumRanks] = useState('');
  const [numRanksHasEnabled, setNumRanksHasEnabled] = useState(false);
  const setScene = useContext(SceneSetContext);

  async function handleStart() {
    const msgs = [];
    let numRanksNum = charIdSet.size;

    if (charIdSet.size < 2) {
      msgs.push('・キャラクターを2人以上選択してください。');
    }

    if (numRanksHasEnabled) {
      const nr = Number(numRanks);
      if (Number.isNaN(nr) || nr < 1) {
        msgs.push('・ランク数制限には1以上の数値を入力してください。');
      } else {
        numRanksNum = nr;
      }
    }

    if (msgs.length !== 0) {
      alert(msgs.join('\n'));
      return;
    }

    // numRanksをcharIdSet.size以下にしないと、比較画面で正確な進捗率を表示できなくなる。
    const initialSortHistory = sorter.newSortHistory(charIdSet, Math.min(numRanksNum, charIdSet.size), random.genSeed());
    let initialAutosaveIsEnabled = true;

    try {
      await save.clearSaveData();
      await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    } catch (e) {
      console.error(`Setup: handleStart: autosave error: ${e}`);
      initialAutosaveIsEnabled = false;
    }

    setScene(
      <Compare
        sorterTitle={sorterTitle}
        initialSortHistory={initialSortHistory}
        initialAutosaveIsEnabled={initialAutosaveIsEnabled}
      />
    );
  }

  function handleAllChange(checked) {
    const newCharIdSet = checked ?
          new Set(le.charIdsAll) :
          new Set();
    setCharIdSet(newCharIdSet);
  }

  function handleWorkChange(workId, checked) {
    const newCharIdSet = checked ?
          charIdSet.union(new Set(le.works[workId].chars)) :
          charIdSet.difference(new Set(le.works[workId].chars));
    setCharIdSet(newCharIdSet);
  }

  function handleCharChange(charId, checked) {
    const newCharIdSet = checked ?
          charIdSet.union(new Set([charId])) :
          charIdSet.difference(new Set([charId]));
    setCharIdSet(newCharIdSet);
  }

  return (
    <div className="setup">
      <h1 className="setup-title">連縁キャラソート</h1>

      <div className="setup-chars-container" data-testid="setup-chars-container">
        <label>
          <input
            type="checkbox"
            className="setup-check-all"
            checked={charIdSet.isSupersetOf(new Set(le.charIdsAll))}
            onChange={e => handleAllChange(e.target.checked)}
          />
          全員
        </label>

        <div className="setup-chars-workgroup-container">
          {
            le.workIdsAll.map((w, i) =>
              <WorkGroup
                key={i}
                onWorkChange={handleWorkChange}
                onCharChange={handleCharChange}
                charIdSet={charIdSet}
                workId={w}
              />
            )
          }
        </div>
      </div>

      <span className="setup-numranks-container">
        <input
          type="checkbox"
          checked={numRanksHasEnabled}
          onChange={e => setNumRanksHasEnabled(e.target.checked)}
        />
        ランクインするランクの数を
        <input
          type="number"
          className="setup-numranks"
          min="1"
          max="999"
          disabled={!numRanksHasEnabled}
          onChange={e => setNumRanks(e.target.value)}
          value={numRanks}
        />
        に制限
      </span>

      <span className="setup-sorter-title-container">
        どっちが
        <input
          type="text"
          className="setup-sorter-title"
          maxLength="70"
          size="10"
          onChange={e => setSorterTitle(e.target.value)}
          value={sorterTitle}
        />
        ？
      </span>

      <button
        className="setup-start"
        onClick={handleStart}
      >
        はじめる
      </button>

      <hr className="setup-hr-opts-desc" />

      <details className="setup-usage">
        <summary>使い方</summary>
        <p>連縁キャラソートでは、選択したキャラと設定をもとにランキングを作ることができます。</p>

        <ol>
          <li>ソート対象のキャラを選択します。グループごとや全キャラを一括で選択することもできます。</li>
          <li>ランキングに入るランクの数の制限を設定できます。設定した場合、制限から漏れたキャラはランク外になります。設定しない場合、ソート対象のすべてのキャラがランクインします。
            <ul>
              <li>例えば、制限を3に設定してかつ同率がいない場合、1~3位に入らなかったキャラは、ランク外としてソート結果に表示されます。</li>
              <li>同率であれば何人でも同じ順位になることができます。例えば、制限を3に設定した場合、同率1位が複数人いれば、ランクインする人数は三人より多くなります。</li>
            </ul>
          </li>
          <li>ランキングのタイトルを設定できます。設定したタイトルは、キャラの選択時やソート結果に表示されます。</li>
          <li>キャラソートを始めます。</li>
          <li>キャラ二人のどちらか、あるいはその他の選択肢から一つの選択肢を選ぶことができます。一つ選択すると次の選択画面が表示されるので、キャラソートが完了するまで選択を続けます。
            <ul>
              <li>キャラを選択した場合、選択したキャラは選択しなかった方のキャラよりもタイトルに沿ったキャラということになります。例えば、すきなキャラのランキングを作るのであれば、二人のうち、よりすきな方のキャラを選びます。</li>
              <li>「どちらも」を選択した場合、現在表示されている二人のキャラは同率ということになります。二人はソート結果で同じ順位になります。</li>
              <li>左矢印を選択した場合、最後の操作を取り消して選び直すことができます。</li>
              <li>右矢印を選択した場合、最後の操作の取り消しを取り消すことができます。</li>
            </ul>
          </li>
          <li>ランキングが完成すると、キャラソートが完了してソート結果が表示されます。ソート結果のリンクや画像を取得したり、Xに投稿したりすることができます。</li>
        </ol>

        <p>キャラソートの進行状態は自動保存されます。一度プログラムを終了した後にもう一度起動すると、最後に自動保存されたところから再開します。自動保存されたデータは、キャラソート中もしくはソート結果からキャラソートをやり直すときに削除されます。</p>

        <p>もし不具合らしき動作等を見つけた場合は報告いただけると幸いです。必ずしも対応できるわけではありませんが……</p>

        <p>このプログラムのソースコードは<a href="https://github.com/shimon1024/lecharsorter" target="_blank">こちらにあります</a>。</p>
      </details>

      <details className="setup-license">
        <summary>利用条件</summary>
        <p>このプログラムは<a href="https://mugentrick.tubakurame.com/Guide.html" target="_blank">連縁の二次創作ガイドライン</a>の範囲内で自由に利用、改変、複製、再配布することができますが、全て無保証とさせていただきます。</p>
      </details>

      <details className="setup-changelog">
        <summary>更新履歴</summary>
        <ul>
          <li>ver 1.0: 公開</li>
        </ul>
      </details>
    </div>
  );
}
