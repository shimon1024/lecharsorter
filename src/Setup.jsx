import { useState } from 'react';
import './Setup.css';
import * as le from './lenen.js';

function GameGroup({ work }) {
  return (
    <ul className="gamegroup-tree">
      <li>
        <details>
          <summary><label><input type="checkbox" />{work.name}</label></summary>
          <ul>
            {
              work.chars.map(c =>
                <li key={c.id}>
                  <label className="gamegroup-char">
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

  return (
    <div className="setup">
      <h1 className="setup-title">連縁キャラソート</h1>

      <div className="setup-chars-container">
        <label><input type="checkbox" />全員</label>
        <div className="setup-chars-gamegroup-container">
          <GameGroup work={le.mains} />
          <GameGroup work={le.ee} />
          <GameGroup work={le.ems} />
          <GameGroup work={le.rmi} />
          <GameGroup work={le.bpohc} />
          <GameGroup work={le.botc} />
          <GameGroup work={le.albums} />
          <GameGroup work={le.videos} />
          <GameGroup work={le.others} />
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

      <button className="setup-start">はじめる</button>

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
