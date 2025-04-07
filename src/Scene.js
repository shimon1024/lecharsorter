import { useContext, useEffect } from 'react';
import { SceneContext } from './SceneContext.jsx';

export default function Scene() {
  useEffect(() => {
    scroll({
      top: 0,
      behavior: 'instant',
    });
  });

  return useContext(SceneContext);
}
