import { useState, useContext } from 'react';
import './Setup.css';
import { SceneSetContext } from './SceneContext.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';
import * as random from './random.js';

function WorkGroup({ onWorkChange, onCharChange, charSet, work }) {
  return (
    <ul className="workgroup-tree">
      <li>
        <details>
          <summary>
            <label>
              <input
                type="checkbox"
                checked={charSet.isSupersetOf(new Set(work.chars.map(c => c.id)))}
                onChange={e => onWorkChange(work, e.target.checked)}
              />
              {work.name}
            </label>
          </summary>
          <ul>
            {
              work.chars.map(c =>
                <li key={c.id}>
                  <label className="workgroup-char">
                    <input
                      type="checkbox"
                      checked={charSet.has(c.id)}
                      onChange={e => onCharChange(c, e.target.checked)}
                    />
                    {c.name}
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
  const [charSet, setCharSet] = useState(new Set(le.charIdsDefault));
  const [numRanks, setNumRanks] = useState(10);
  const setScene = useContext(SceneSetContext);

  function handleAllChange(checked) {
    const newCharSet = checked ?
          new Set(le.charIdAll) :
          new Set();
    setCharSet(newCharSet);
  }

  function handleWorkChange(work, checked) {
    const newCharSet = checked ?
          charSet.union(new Set(work.chars.map(c => c.id))) :
          charSet.difference(new Set(work.chars.map(c => c.id)));
    setCharSet(newCharSet);
  }

  function handleCharChange(char_, checked) {
    const newCharSet = checked ?
          charSet.union(new Set([char_.id])) :
          charSet.difference(new Set([char_.id]));
    setCharSet(newCharSet);
  }

  return (
    <div className="setup">
      <h1 className="setup-title">連縁キャラソート</h1>

      <div className="setup-chars-container" data-testid="setup-chars-container">
        <label>
          <input
            type="checkbox"
            checked={charSet.isSupersetOf(new Set(le.charIdAll))}
            onChange={e => handleAllChange(e.target.checked)}
          />
          全員
        </label>

        <div className="setup-chars-workgroup-container">
          {
            le.workAll.map((w, i) =>
              <WorkGroup
                key={i}
                onWorkChange={handleWorkChange}
                onCharChange={handleCharChange}
                charSet={charSet}
                work={w}
              />
            )
          }
        </div>
      </div>

      <span className="setup-numranks-container">
        ランキング人数
        <select
          className="setup-numranks"
          value={String(numRanks)}
          onChange={e => setNumRanks(Number(e.target.value))}
        >
          <option value="1">1位のみ</option>
          <option value="3">3位まで</option>
          <option value="5">5位まで</option>
          <option value="10">10位まで</option>
          <option value="20">20位まで</option>
          <option value={String(le.charAll.length)}>全員</option>
        </select>
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
        onClick={() =>
          setScene(
            <Compare
              charIdSet={charSet}
              numRanks={numRanks}
              sorterTitle={sorterTitle}
              randSeed={random.genSeed()}
            />
          )
        }
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
