import React, { useLayoutEffect, useRef, Suspense, useMemo, useCallback } from 'react'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, LinearFilter, RGBFormat, Vector2, Object3D } from 'three';
import { OrbitControls } from '@react-three/drei';

import { gsap } from 'gsap';

import Interactivity, { texture } from './interactivity';
import { vertex, fragment } from './shaders';
import { flowersArray } from './images';

import "./App.css";

const Particles = () => {
	const instanceMeshRef = useRef()

	let { uSize, uDepth } = useMemo(() => {
		let uSize = { value: 0.0 }
		let uDepth = { value: -30.0 }
		
		return { uSize, uDepth }
	}, [])

	const ts = useLoader(TextureLoader, flowersArray, texture => {
		texture.minFilter = LinearFilter
		texture.magFilter = LinearFilter
		texture.format = RGBFormat
	})

	let randomPick = Math.floor(Math.random() * flowersArray.length)
	const text = ts[randomPick]

	const width = text.image.width
	const height = text.image.height
	const dots = width * height

	const showParticles = useCallback( (dValue, sValue,  callback) => {
		gsap.timeline({ onComplete: callback })
			.to(uDepth, { duration: 1.0, value: dValue, ease: "circ.out" })
			.to(uSize, { duration: 2.0, value: sValue, ease: "power4.out" }, '-=1.0')

	}, [uDepth, uSize])

	const { sIndices, sPositions } = useMemo(() => {
		const sIndices = new Uint16Array(dots)
		const sPositions = new Float32Array(dots * 3)

		for (let i = 0; i < dots; i++) {
			sIndices[i] = i

			sPositions[i*3+0] = (i % width)
			sPositions[i*3+1] = Math.floor(i / width)
		}

		return { sIndices, sPositions }
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
		showParticles(2.0, 1.0)
	}, [dots, sPositions, showParticles])

	useFrame( ({clock}) => {
		instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime
	})

	let inMotion = false
	const nextFlower = () => {
		if(inMotion) return

		clearInterval(timer)
		timer = setInterval(nextFlower, 20000)

		inMotion = true
		randomPick >= flowersArray.length-1 ? randomPick = 0 : randomPick++
		instanceMeshRef.current && showParticles(20.0, 0.0, () => { 
			instanceMeshRef.current.material.uniforms.uTexture.value = ts[randomPick] 
			uDepth.value = -30.0
			showParticles(2.0, 1.0, () => inMotion = false)
		})
	}

	let timer = setInterval(nextFlower, 20000)
	window.addEventListener('click', nextFlower)

	const uniforms = {
		uSize, uDepth,
		uTime: { value: 0.0 },
		uRayTexture: { value: texture },
		uTexture: { value: text },
		uTextureSize: { value: new Vector2(width, height) },
	}

	return (
		<React.Fragment>
			<instancedMesh ref={instanceMeshRef} args={[null, null, dots]}>
				<planeBufferGeometry attach="geometry" args={[1, 1]}>
					<instancedBufferAttribute attachObject={['attributes', 'offset']} args={[sPositions, 3, false]} />
					<instancedBufferAttribute attachObject={['attributes', 'index']} args={[sIndices, 1, false]} />
				</planeBufferGeometry>
				<shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragment} vertexShader={vertex} transparent={true} depthTest={false}/>
			</instancedMesh>
			<Interactivity width={width} height={height}/>
		</React.Fragment>
	)
}

export default function App() {
	const cameraProps = {
		fov: 75,
		near: 1,
		far: 2000,
		position: [0, 0, 200]
	}

	return (
		<div id="container">
			<Canvas gl={{ alpha: false }} dpr={[window.devicePixelRatio, 2]} camera={cameraProps} colorManagement={true}>
				<Suspense fallback={null}>
					<Particles/>
				</Suspense>
				<OrbitControls enablePan={false} enableZoom={true} enableRotate={false} />
			</Canvas>
		</div>
	)
}