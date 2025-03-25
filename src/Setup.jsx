import { useState, useContext } from 'react';
import './Setup.css';
import { SceneSetContext } from './SceneContext.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';
import * as random from './random.js';

function WorkGroup({ onWorkChange, onCharChange, charIdSet, workId }) {
  return (
    <ul className="workgroup-tree">
      <li>
        <details>
          <summary>
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
          className="setup-numranks-checkbox"
          checked={numRanksHasEnabled}
          onChange={e => setNumRanksHasEnabled(e.target.checked)}
        />
        順位の数を
        <input
          type="text"
          className="setup-numranks"
          maxLength="4"
          disabled={!numRanksHasEnabled}
          onChange={e => setNumRanks(e.target.value)}
          value={numRanks}
        />
        位までに制限
      </span>

      <span className="setup-sorter-title-container">
        どっちが
        <input
          type="text"
          className="setup-sorter-title"
          maxLength="70"
          onChange={e => setSorterTitle(e.target.value)}
          value={sorterTitle}
        />
        ？
      </span>

      <button
        className="setup-start"
        onClick={() => {
          const msgs = [];
          let numRanksNum = charIdSet.size;

          if (charIdSet.size < 2) {
            msgs.push('・キャラクターを2人以上選択してください。');
          }

          if (numRanksHasEnabled) {
            const nr = Number(numRanks);
            if (Number.isNaN(nr)) {
              msgs.push('・制限する順位には数値を入力してください。');
            } else {
              numRanksNum = nr;
            }
          }

          if (msgs.length !== 0) {
            alert(msgs.join('\n'));
            return;
          }

          // numRanksをcharIdSet.size以下にしないと、比較画面で正確な進捗率を表示できなくなる。
          setScene(
            <Compare
              charIdSet={charIdSet}
              numRanks={Math.min(numRanksNum, charIdSet.size)}
              sorterTitle={sorterTitle}
              randSeed={random.genSeed()}
            />
          );
        }}
      >
        はじめる
      </button>

      <hr className="setup-hr-opts-desc" />

      <details className="setup-usage">
        <summary>使い方</summary>
        こんなかんじです
      </details>

      <details className="setup-changelog">
        <summary>更新履歴</summary>
        こんなかんじでした
      </details>
    </div>
  );
}
