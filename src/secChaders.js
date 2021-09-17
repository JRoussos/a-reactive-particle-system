const fragment = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float time;
uniform vec2 uMouse;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;

void main() {
    vec4 text = texture2D(uTexture, vUv);
	float threashold = 0.2;

	float r = floor(threashold / text.r);
	float g = floor(threashold / text.g);
	float b = floor(threashold / text.b);

	vec4 final = vec4(r, g, b, 1.);

	gl_FragColor = final;
}`

const vertex = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;

void main() {
	vUv = uv;
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0 );
}`

export { vertex, fragment }