import React, { useLayoutEffect, useRef, Suspense, useMemo, useCallback } from 'react'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, LinearFilter, RGBFormat, Vector2, Object3D } from 'three';
import { OrbitControls } from '@react-three/drei';

import { gsap } from 'gsap';

import { vertex, fragment } from './newShaders';
import { flowersArray } from './images';

import "./App.css";

const Particles = () => {
	const instanceMeshRef = useRef()
	let uMouse = new Vector2()

	let { uSize, uDepth } = useMemo(() => {
		let uSize = { value: 0.0 }
		let uDepth = { value: -30.0 }
		
		return { uSize, uDepth }
	}, [])

	let randomPick = Math.floor(Math.random() * flowersArray.length)

	const ts = useLoader(TextureLoader, flowersArray, texture => {
		texture.minFilter = LinearFilter
		texture.magFilter = LinearFilter
		texture.format = RGBFormat
	})

	const text = ts[randomPick]

	const width = text.image.width
	const height = text.image.height

	const dots = width * height

	console.log(`width: ${width}`, `height: ${height}`, `dots: ${dots}`);

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
		showParticles(2.0, 1.0)
	}, [dots, sPositions, showParticles])

	useFrame( ({clock}) => {
		instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime

		// instanceMeshRef.current.rotation.x += Math.cos(clock.getElapsedTime() / 2) * 0.005
		// instanceMeshRef.current.rotation.y += Math.cos(clock.getElapsedTime() / 2) * 0.005
	})

	const pointers = []

	window.addEventListener('pointerdown', e => pointers.push(e))
	window.addEventListener('pointerup', e => pointers.pop(e))

	window.addEventListener('pointermove', e => {	
		if(pointers.length > 1 ) return 
		let pointX = 0.5 + ((e.clientX / window.innerWidth) * 2 - 1)
		let pointY = 0.5 + ((e.clientY / window.innerHeight) * -2 + 1)

		gsap.to(uMouse, { duration: 1.0, x: pointX, y: pointY })
	})

	setInterval(() => {
		randomPick >= flowersArray.length-1 ? randomPick = 0 : randomPick++
		instanceMeshRef.current && showParticles(20.0, 0.0, () => { 
			instanceMeshRef.current.material.uniforms.uTexture.value = ts[randomPick] 
			showParticles(2.0, 1.0)
		})
	}, 10000);

	const uniforms = {
		uSize,
		uDepth,
		uTime: { value: 0.0 },
		uMouse: { value: uMouse },
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
		zoom: window.innerHeight > window.innerWidth ? Math.min(window.innerHeight/window.innerWidth, 2) : Math.min(window.innerWidth/window.innerHeight, 2),
		far: 2000,
		position: [0, 0, 400]
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