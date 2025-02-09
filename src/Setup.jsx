import { useState } from 'react'
import './Setup.css'

function GameGroup({name, chars}) {
  return (
    <ul className="gamegroup-tree">
      <li>
        <details>
          <summary><label><input type="checkbox" />{name}</label></summary>
          <ul>
            {chars.map((c, i) => <li key={i}><label className="gamegroup-char"><input type="checkbox" />{c}</label></li>)}
          </ul>
        </details>
      </li>
    </ul>
  );
}

export default function Setup() {
  const [sorterTitle, setSorterTitle] = useState("すき");

  return (
    <>
      <h1 className="setup-title">連縁キャラソート</h1>

      <div className="setup-chars-container">
        <label><input type="checkbox" />すべて</label>
        <div className="setup-chars-gamegroup-container">
          <GameGroup name={"作品1"} chars={["キャラ1", "キャラ2", "キャラ3"]} />
          <GameGroup name={"作品2"} chars={["キャラ4", "キャラ5", "あいうえおかきくけこさしすせそたちつてと"]} />
          <GameGroup name={"作品3"} chars={["キャラ7", "キャラ8", "龍龍龍龍龍龍龍龍"]} />
          <GameGroup name={"作品4"} chars={["キャラ10", "キャラ11", "キャラ12"]} />
          <GameGroup name={"作品5"} chars={["キャラ13", "キャラ14", "キャラ15"]} />
        </div>
      </div>

      <span className="setup-numchars-container">
        ランキング人数
        <select className="setup-numchars">
          <option>1位のみ</option>
          <option>3位まで</option>
          <option>5位まで</option>
          <option selected>10位まで</option>
          <option>20位まで</option>
          <option>すべて</option>
        </select>
      </span>

      <span className="setup-sorter-title-container">
        どっちが
        <input
          type="text"
          size="25"
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
    </>
  );
}
