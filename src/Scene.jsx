import { useContext } from 'react';
import { SceneContext } from './SceneContext.jsx';

export default function Scene() {
  return useContext(SceneContext);
}
