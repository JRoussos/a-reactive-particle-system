import React, { useLayoutEffect, useRef, Suspense, useMemo } from 'react'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, LinearFilter, RGBFormat, Vector2, Object3D } from 'three';
import { OrbitControls } from '@react-three/drei';

import { vertex, fragment } from './newShaders';
import logo from './img/unsplash_small.jpg';

import "./App.css";

const Particles = () => {
	const instanceMeshRef = useRef()
	
	const text = useLoader(TextureLoader, logo, texture => {
		texture.minFilter = LinearFilter
		texture.magFilter = LinearFilter
		texture.format = RGBFormat
	})

	const width = text.image.width
	const height = text.image.height

	const dots = width * height

	const { sIndices, sPositions } = useMemo(() => {
		const sIndices = new Uint16Array(dots)
		const sPositions = new Float32Array(dots * 3)

		for (let i = 0; i < dots; i++) {
			sIndices[i] = i

			sPositions[i*3+0] = (i % width)
			sPositions[i*3+1] = Math.floor(i / width)
		}

		return { sIndices, sPositions}
	}, [dots, width])
	
	useLayoutEffect(() => {
		const tempObject = new Object3D()

		for (let index = 0; index < dots; index++){
			tempObject.position.set(
				sPositions[index*3+0], 
				sPositions[index*3+1], 
				sPositions[index*3+2]
			)

			tempObject.updateMatrix()
			instanceMeshRef.current.setMatrixAt(index, tempObject.matrix)
		}
		instanceMeshRef.current.instanceMatrix.needsUpdate = true
	}, [dots, sPositions])

	useFrame( ({clock}) => {
		instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime
	})

	const uniforms = {
		uTime: { value: 0.0 },
		uTexture: { value: text },
		uTextureSize: { value: new Vector2(width, height) },
	}

	return (
		<instancedMesh ref={instanceMeshRef} args={[null, null, dots]}>
			<planeBufferGeometry attach="geometry" args={[1, 1]}>
				<instancedBufferAttribute attachObject={['attributes', 'offset']} args={[sPositions, 3, false]} />
				<instancedBufferAttribute attachObject={['attributes', 'index']} args={[sIndices, 1, false]} />
			</planeBufferGeometry>
			<shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragment} vertexShader={vertex} transparent={true} depthTest={false}/>
		</instancedMesh>
	)
}

export default function App() {
	const cameraProps = {
		fov: Math.atan((window.innerHeight / 2) / 400) * 2 * (180 / Math.PI),
		near: 1,
		zoom: 2.5,
		far: 2000,
		position: [0, 0, 400]
	}

	return (
		<div id="container">
			<Canvas gl={{ alpha: false }} dpr={[window.devicePixelRatio, 2]} camera={cameraProps} colorManagement={true}>
				<Suspense fallback={null}>
					<Particles />
				</Suspense>
				<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
			</Canvas>
			{/* <Loader dataInterpolation={ (p) => `${(p * 100).toFixed(2)}%` }/> */}
		</div>
	)
}