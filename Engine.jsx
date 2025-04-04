/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/engine.glb -T 
Files: public/models/engine.glb [69.68KB] > C:\Users\Cezar Luca\Desktop\5. WebDev\AR_CAD_Viewer\my-ar-cad-viewer\engine-transformed.glb [6.42KB] (91%)
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/engine-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Suzanne.geometry} material={nodes.Suzanne.material} />
    </group>
  )
}

useGLTF.preload('/engine-transformed.glb')
