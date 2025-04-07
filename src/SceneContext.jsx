import { createContext, useState } from 'react';

export const SceneContext = createContext(null);
export const SceneSetContext = createContext(null);

// このコンポーネントを直接利用する場合、defaultSceneは最初の値のみが有効であることに注意。
// defaultSceneがstateであっても、stateの変化に影響されない。
export function SceneProvider({ children, defaultScene }) {
  const [scene, setScene] = useState(defaultScene);

  return (
    <SceneContext.Provider value={scene}>
      <SceneSetContext.Provider value={setScene}>
        {children}
      </SceneSetContext.Provider>
    </SceneContext.Provider>
  );
}
