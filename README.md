# A "Reactive" Particle System
[![](preview.gif "Live Preview")](https://some-flowers-for-you.netlify.app/)

[Live Preview](https://some-flowers-for-you.netlify.app/)

A demo for splitting images into their pixels and animate each of them as a particle with its own attributes and mouse interactions using React and React Three Fiber. Based on [this](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/) article by [Bruno Imbrizi](http://brunoimbrizi.com/).

### What I learned 
- How to handle large numbers of particles in [r3f]( https://docs.pmnd.rs/react-three-fiber/getting-started/introduction "React Three Fiber") using instances. Basically we create one geometry and rendering it as many times as the pixels of the image, instead of having geometries for every pixel. 

- Also I learned [this]((https://i7x7p5b7.stackpathcdn.com/codrops/wp-content/uploads/2019/01/codrops-05.gif)) cool technique to interact with the particles that uses a new canvas on top of the existing one, onto which we draw circles at the mouse raycasted position, basically forming ripples on the canvas at every mouse move, and then using that as a texture for the particles vertex shader to move them accordingly. 

### Run
- Install `npm install`
- Run `npm start`
- Build `npm run build`

### Libraries

- [Three.js](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene) - The WebGL library behind all the animations
- [R3f](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) - A really (REALLY!) helpful library, its a React renderer for three.js
- [gsap](https://greensock.com/gsap/) - An animation library for handling the exploding effect of the particles.

