import { useContext } from 'react';
import Setup from './Setup.jsx';
import { SceneSetContext } from './SceneContext.jsx';
import './ErrorPage.css';

export const messageClearSaveData = '保存された進行状態の削除に失敗しました。削除しないままキャラソートを続行しますが、自動保存機能が無効になる可能性があります。';
export const messageOpenViewMode = '結果へのリンクを開くことができませんでした。URL内のデータが破損している可能性があります。';

export default function ErrorPage({ message }) {
  const setScene = useContext(SceneSetContext);

  return (
    <div className="errorpage">
      <span className="errorpage-title">エラー</span>
      <span className="errorpage-message">{message}</span>
      <button className="errorpage-home" onClick={() => setScene(<Setup />)}>ホームに戻る</button>
    </div>
  );
}
