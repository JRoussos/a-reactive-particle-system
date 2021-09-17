import React, { useRef, Suspense } from 'react'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, LinearFilter, RGBFormat, Vector2 } from 'three';
import { OrbitControls } from '@react-three/drei';

import { vertex, fragment } from './secChaders';
import logo from './img/logo-192.png';

import "./App.css";

const Hero = () => {
  const meshRef = useRef()
  const uMouse = new Vector2()

  const text = useLoader(TextureLoader, logo, texture => {
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.format    = RGBFormat
  })

  const width = text.image.width
  const height= text.image.height

  window.addEventListener('pointermove', e => {
      uMouse.x = (e.clientX/window.innerWidth) * 2 - 1
      uMouse.y = -(e.clientY/window.innerHeight) * 2 + 1
  })

  useFrame( ({clock}) => {
      meshRef.current.material.uniforms.uMouse.value = uMouse
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
  })

  const uniforms = {
    uTime: { value: 0 },
    uTexture: { value: text },
    uMouse: { value: uMouse},       
    uTextureSize: { value: new Vector2(width, height)},
  }

  return(
      <mesh ref={meshRef} position={[0, 0, 0]}>
            <planeBufferGeometry attach="geometry" args={[192, 192]}/>
            <shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragment} vertexShader={vertex}/>
      </mesh>
  )
}

export default function App() {
    const cameraProps = {
        fov: Math.atan((window.innerHeight/2)/600)*2*(180/Math.PI),
        near: 100,
        far: 2000,
        position: [0, 0, 600]
    }

    return (
        <div id="container">
        <Canvas dpr={[window.devicePixelRatio, 2]} camera={cameraProps}>
            <Suspense fallback={null}>
                <Hero/> 
            </Suspense>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
        </div>
    )
}