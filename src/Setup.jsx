function GameGroup({name, chars}) {
  return (
    <ul>
      <li>
        <details>
          <summary><label><input type="checkbox" />{name}</label></summary>
          <ul>
            {chars.map((c, i) => <li key={i}><label><input type="checkbox" />{c}</label></li>)}
          </ul>
        </details>
      </li>
    </ul>
  );
}

export default function Setup() {
  return (
    <>
      <h1>連縁キャラソート</h1>
      <button style={{textalign: 'center'}}>スタート</button>
      <label><input type="checkbox" />すべて</label>
      <GameGroup name={"作品1"} chars={["キャラ1", "キャラ2", "キャラ3"]} />
      <GameGroup name={"作品2"} chars={["キャラ4", "キャラ5", "キャラ6"]} />
      <GameGroup name={"作品3"} chars={["キャラ7", "キャラ8", "キャラ9"]} />
      <GameGroup name={"作品4"} chars={["キャラ10", "キャラ11", "キャラ12"]} />
      <GameGroup name={"作品5"} chars={["キャラ13", "キャラ14", "キャラ15"]} />
      <select>
        <option>1位のみ</option>
        <option>3位まで</option>
        <option>5位まで</option>
        <option selected>10位まで</option>
        <option>20位まで</option>
        <option>すべて</option>
      </select>
      <div>どっちが<input type="text" maxlength="128" value="好き" />？</div>
      <details>
        <summary>使い方</summary>
        こんなかんじです
      </details>
      <details>
        <summary>更新履歴</summary>
        こんなかんじでした
      </details>
      <div>開発: <a href="https://postfixnotation.org/">志文</a></div>
    </>
  );
}
