import { useState, useContext } from 'react';
import './Setup.css';
import { SceneSetContext } from './SceneContext.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';

function WorkGroup({ work }) {
  return (
    <ul className="workgroup-tree">
      <li>
        <details>
          <summary><label><input type="checkbox" />{work.name}</label></summary>
          <ul>
            {
              work.chars.map(c =>
                <li key={c.id}>
                  <label className="workgroup-char">
                    <input type="checkbox" />
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
  const setScene = useContext(SceneSetContext);

  return (
    <div className="setup">
      <h1 className="setup-title">連縁キャラソート</h1>

      <div className="setup-chars-container">
        <label><input type="checkbox" />全員</label>
        <div className="setup-chars-workgroup-container">
          <WorkGroup work={le.mains} />
          <WorkGroup work={le.ee} />
          <WorkGroup work={le.ems} />
          <WorkGroup work={le.rmi} />
          <WorkGroup work={le.bpohc} />
          <WorkGroup work={le.botc} />
          <WorkGroup work={le.albums} />
          <WorkGroup work={le.videos} />
          <WorkGroup work={le.others} />
        </div>
      </div>

      <span className="setup-numchars-container">
        ランキング人数
        <select className="setup-numchars" defaultValue="10">
          <option>1位のみ</option>
          <option>3位まで</option>
          <option>5位まで</option>
          <option value="10">10位まで</option>
          <option>20位まで</option>
          <option>全員</option>
        </select>
      </span>

      <span className="setup-sorter-title-container">
        どっちが
        <input
          type="text"
          className="setup-sorter-title"
          maxLength="128"
          onChange={e => setSorterTitle(e.target.value)}
          value={sorterTitle}
        />
        ？
      </span>

      <button
        className="setup-start"
        onClick={() => setScene(<Compare sorterTitle="すき" />)}
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
