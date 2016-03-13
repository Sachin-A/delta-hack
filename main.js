//Storing viewport details
var width = window.innerWidth / 2;
var height = window.innerHeight;

//Rendering settings and addition to the DOM
var renderer = new THREE.WebGLRenderer(
{
	antialias: true
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//Scene creation 
var scene = new THREE.Scene;

//Camera
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.y = 700;
camera.position.z = 500;
scene.add(camera);

//Skybox to house the POV
var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
var skyboxMaterial = new THREE.MeshBasicMaterial(
{
	color: 0x000000,
	side: THREE.BackSide
});
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

//Sources of light
var pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 300, 200);
scene.add(pointLight);

var pointLight2 = new THREE.PointLight(0xffffff);
pointLight2.position.set(0, -300, 200);
scene.add(pointLight2);

//To render 3D replica of model using to type of simple shape detected and it's approximate dimensions
function model(data)
{
	data = JSON.parse(data)
	if (data['type'] == "cuboid")
	{
		var a = data['l'];
		var b = data['b'];
		var c = data['h'];
		cuboid(a, b, c);
	}
	else if (data.type == "sphere")
	{
		var r = data['r'];
		sphere(r);
	}
}

//Cuboid modelling
function cuboid(l, b, h)
{
	//Receiving dimensions
	var c_length = l;
	var c_breadth = b;
	var c_height = h;

	//Setting cube geometry
	var cubeGeometry = new THREE.BoxGeometry(c_length, c_breadth, c_height, 10, 10, 10);
	var cubeMaterial = new THREE.MeshBasicMaterial(
	{
		color: 0xfffff,
		wireframe: true
	});
	var body = new THREE.Mesh(cubeGeometry, cubeMaterial);

	//Initial angle
	body.rotation.y = Math.PI * 45 / 180;
	body.name = "body";

	//Adding to world
	scene.add(body);

	//Setting Camera to look at the body 
	camera.lookAt(body.position);

	//Clock for delta time to enable rotation
	var clock = new THREE.Clock;

	//Requestanimationframe to render 3D images at appropriate frame rate
	function render()
	{
		renderer.render(scene, camera);
		body.rotation.z -= clock.getDelta();
		cuboid_rendering = requestAnimationFrame(render);
		frameid.innerHTML = cuboid_rendering;
	}
	render();
}

function sphere(r)
{
	//Recieving dimensions
	var c_radius = r;

	//Setting cube geometry
	var geometry = new THREE.SphereGeometry(c_radius, 32, 32);
	var material = new THREE.MeshBasicMaterial(
	{
		color: 0xfffff,
		wireframe: true
	});
	var body = new THREE.Mesh(geometry, material);

	//Initial angle
	body.rotation.y = Math.PI * 45 / 180;
	body.name = "body";

	//Adding to world
	scene.add(body);

	//Setting Camera to look at the body 
	camera.lookAt(body.position);

	//Clock for delta time to enable rotation
	var clock = new THREE.Clock;

	//Requestanimationframe to render 3D images at appropriate frame rate
	function render()
	{
		renderer.render(scene, camera);
		body.rotation.z -= clock.getDelta();
		sphere_rendering = requestAnimationFrame(render);
		frameid.innerHTML = sphere_rendering;
	}
	render();
}

//Remove object when new video is being recorded
function removeobj()
{
	var i;
	for (i = scene.children.length - 1; i > 0; i--)
	{
		var obj = scene.children[i];
		if (obj.name == 'body')
		{
			scene.remove(obj);
		}
	}
}

//Cancel request animation frame
function stoprendering(id)
{
	removeobj();
	window.cancelAnimationFrame(id);
}