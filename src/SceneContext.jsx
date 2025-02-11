import { createContext, useState } from 'react';

export const SceneContext = createContext(null);
export const SceneSetContext = createContext(null);

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
