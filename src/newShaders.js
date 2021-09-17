const fragment = `
precision highp float;

varying vec2 vUv;
varying vec2 vPUv;

uniform sampler2D uTexture;

void main() {
    vec2 uv = vUv;
    vec2 puv = vPUv;

    vec4 text = texture2D(uTexture, puv);

	float border = 0.3;
	float radius = 0.5;
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);

    float threashold = 0.15;
    if ( text.r < threashold || text.g < threashold || text.b < threashold ) discard;

    gl_FragColor = vec4(text.rgb, t);
}`

const vertex = `
precision highp float;

attribute vec3 offset; 
attribute float index;

varying vec2 vUv;
varying vec2 vPUv;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float circle(vec2 _st, float _radius, float blurriness){
    vec2 dist = _st;
    return 1.0 - smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), sqrt(dot(dist,dist) * 4.0));
}

float random(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main() {
	vUv = uv;

    vec2 puv = offset.xy / uTextureSize;
    vPUv = puv;

    vec4 text = texture2D(uTexture, puv);
	float colorIntensity = text.r * 0.21 + text.g * 0.71 + text.b * 0.07;
    
    vec3 displaced = offset;

	float rndz = (random(index) + snoise(vec2(index * 0.1, uTime * 0.1)));
    displaced.xy += vec2(random(index) - 0.5, random(offset.x + index) - 0.5);
	displaced.z += rndz * (random(index) * 2.0 * (sin(uTime * 0.2) + 5.));
	
	displaced.xy -= uTextureSize * 0.5;
    
    // float dist = length(puv - uMouse);
    // float t = circle(vec2(dist), 0.1, 5.0);

	// displaced.z += t * 20.0 * rndz;
	// displaced.x += cos(index) * t * 20.0 * rndz;
	// displaced.y += sin(index) * t * 20.0 * rndz;

    float psize = (snoise(vec2(uTime, index) * 0.5) + 2.0);
	psize *= max(colorIntensity, 0.2);
    psize *= 1.5;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	mvPosition.xyz += position * psize;
	vec4 finalPosition = projectionMatrix * mvPosition;

    gl_Position = finalPosition;
}`

export { vertex, fragment }