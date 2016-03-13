//Storing viewport details
var width = window.innerWidth/2;
var height = window.innerHeight;

//Rendering settings and addition to the DOM
var renderer = new THREE.WebGLRenderer({ antialias: true });
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
var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

//Sources of light
var pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 300, 200); 
scene.add(pointLight);

var pointLight2 = new THREE.PointLight(0xffffff);
pointLight2.position.set(0, -300, 200);
scene.add(pointLight2);
