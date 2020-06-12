import './app';

// function render(renderer: Birch.Renderer, mesh: Birch.Mesh): void {
// 	renderer.clear(Birch.Color.Black);
// 	mesh.render();
// 	requestAnimationFrame(render.bind(undefined, renderer, mesh));
// }

// window.addEventListener('load', () => {

// 	const shader = new Birch.Shader(renderer.gl, vertexShader, fragmentShader, new Birch.FastMap([
// 		['a_position', 0],
// 		['a_color', 1],
// 		['a_offset', 2]
// 	]));
// 	shader.activate();
// 	(window as any).shader = shader;
// 	const mesh = new Birch.Mesh(renderer.gl, 2, [
// 		[
// 			new Birch.Mesh.Component(0, 'float', 2, false)],
// 		[
// 			new Birch.Mesh.Component(1, 'float', 4, true),
// 			new Birch.Mesh.Component(2, 'float', 2, true)]]);
// 	mesh.setVertices(0, [
// 		0, 0,
// 		1, 0,
// 		0, 0.5,
// 	], false);
// 	mesh.setVertices(1, [
// 		1, 0, 0, 1, 0, 0,
// 		0, 1, 0, 1, 0.5, 0,
// 		0, 0, 1, 1, -0.5, 0], false);
// 	mesh.setIndices([0, 1, 0, 2, 1, 2], true);
// 	mesh.setNumInstances(3);

// 	render(renderer, mesh);
// });

// const vertexShader = `#version 300 es

// in vec2 a_position;
// in vec4 a_color;
// in vec2 a_offset;
// out vec4 v_color;

// void main() {
//   gl_Position = vec4(a_position + a_offset, 0.0, 1.0);
//   v_color = a_color;
// }`;

// const fragmentShader = `#version 300 es

// precision highp float;

// in vec4 v_color;
// out vec4 o_color;

// void main() {
//   o_color = v_color;
// }`;
