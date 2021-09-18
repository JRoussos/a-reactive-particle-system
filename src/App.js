import React, { useLayoutEffect, useRef, Suspense, useMemo } from 'react'

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

	let { uRandom, uSize, uDepth } = useMemo(() => {
		let uRandom = { value: 1.0 }
		let uSize = { value: 0.0 }
		let uDepth = { value: -30.0 }
		
		return { uRandom, uSize, uDepth }
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

	const showParticles = (dValue, sValue,  callback) => {
		gsap.timeline({ onComplete: callback })
			.to(uDepth, { duration: 1.0, value: dValue, ease: "circ.out" })
			.to(uSize, { duration: 2.0, value: sValue, ease: "power4.out" }, '-=1.0')

	}

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
		showParticles(2.0, 2.0)
	}, [dots, sPositions, uSize, uDepth])

	useFrame( ({clock}) => {
		instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime

		// instanceMeshRef.current.rotation.x += Math.cos(clock.getElapsedTime() / 2) * 0.005
		// instanceMeshRef.current.rotation.y += Math.cos(clock.getElapsedTime() / 2) * 0.005
	})

	// window.addEventListener('pointerdown', () => {
	// 	gsap.getById('up')?.kill();
	// 	gsap.to(uRandom, { duration: 1.5, id: 'down', value: 2.0, ease: "elastic.out(2, 1)" })
	// })

	// window.addEventListener('pointerup', () => {
	// 	gsap.getById('down')?.kill();
	// 	gsap.to(uRandom, { duration: 0.4, id: 'up', value: 1.0, ease: "power4.out" })
	// })

	window.addEventListener('pointermove', e => {		
		let pointX = 0.5 + ((e.clientX / window.innerWidth) * 2 - 1)
		let pointY = 0.5 + ((e.clientY / window.innerHeight) * -2 + 1)

		gsap.to(uMouse, { duration: 1.0, x: pointX, y: pointY})
	})

	window.addEventListener('click', () => {
		randomPick >= flowersArray.length-1 ? randomPick = 0 : randomPick++
		if(instanceMeshRef.current) {

			showParticles(20.0, 0.0, () => { 
				instanceMeshRef.current.material.uniforms.uTexture.value = ts[randomPick] 
				showParticles(2.0, 2.0)
			})
		}
	})

	const uniforms = {
		uRandom,
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
		zoom: 2.5,
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
			{/* <Loader dataInterpolation={ (p) => `${(p * 100).toFixed(2)}%` }/> */}
		</div>
	)
}