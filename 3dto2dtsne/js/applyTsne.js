/*****************************************************************/
var scene3d, scene2d;
var scene3dElement, scene2dElement;
var tsne;
var dists;
var stars3d = [];
var stars2d = [];
var renderer3d, renderer2d;
var camera3d, camera2d;
var controls3d, controls2d;
var circlesGeometry;
var sphereGeometry;
var count = 0;
var paused = false;
var steps = 1000;
var datapoints;
var ratio = 1;
var shapelist = document.getElementById("selectShape");
var opt2d = {
    epsilon: 10, // epsilon is learning rate (10 = default)
    perplexity: 50, // roughly how many neighbors each point influences (30 = default)
    dim: 2 // dimensionality of the embedding
}
var fileuploaded = false;
var Point = function (coords, color) {
	this.coords = coords;
	this.color = color || '#039';
};

function makePoints(originals) {
	var points = originals.map(function (p) {
		return new Point(p);
	});
	return points;
}
function readOurData(){
	fileuploaded = true;
	var shape = shapelist.options[shapelist.selectedIndex].value;
	if(shape != 'empty'){
		if(shape == 'sphere'){
			path = "data/sphere.csv";
		}
		else if (shape == 'torus'){
			path = "data/torus.csv";
		}
		else{
			path = "data/tetrahedron.csv";
		}
		d3.text(path, function(text) {
			var data = [];
			d3.csvParseRows(text).map(function(row) {
				data.push(row.map(function(value) {
					return +value;
				}));
			});
			var nbSteps = $('#steps').val();
			count = 0;
			steps = nbSteps;
			clearScene3();
			clearScene2();
			initPoints(makePoints(data), opt2d, true);
			animate();
		});
	}
	else{
		steps = 0;
		clearScene3();
		clearScene2();
	}
}
// Our Javascript will go here.
function initPoints(points, opt2d, fromfile) {
	stars3d = [];
	stars2d = [];
	datapoints = points;
    if (fromfile)
		dists = distanceMatrix(points);
	tsne2d = new tsnejs.tSNE(opt2d); // create a tSNE instance
	tsne2d.initDataDist(dists);
	for (var i = 0; i < points.length; i++) {
		var x = points[i].coords[0];
		var y = points[i].coords[1];
        var color = points[i].color;
        var material = new THREE.MeshBasicMaterial({color: color});
		if (fromfile){
			//3D
			var mesh = new THREE.Mesh(sphereGeometry, material);
			mesh.position.x = x;
			mesh.position.y = y;
			mesh.position.z = points[i].coords[2];
			stars3d.push(mesh);
			scene3d.add(mesh);
		}
		//2D
		var mesh2d = new THREE.Mesh(circlesGeometry, material);
        mesh2d.position.x = x;
        mesh2d.position.y = y;
        mesh2d.position.z = 0;
        stars2d.push(mesh2d);
        scene2d.add(mesh2d);
    }
}

function initScene() {
    renderer3d = new THREE.WebGLRenderer();
    renderer3d.setClearColor(0xffffff, 0);
    renderer3d.setSize(window.innerWidth/4, 500);
	renderer2d = new THREE.WebGLRenderer();
    renderer2d.setClearColor(0xffffff, 0);
    renderer2d.setSize(window.innerWidth/4, 500);
    scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color(0XFFFFFF);
	scene2d = new THREE.Scene();
    scene2d.background = new THREE.Color(0XFFFFFF);
    camera3d = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera2d = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
	controls2d = new THREE.OrbitControls(camera2d, renderer2d.domElement);
	document.getElementById('playground-canvas3d').appendChild(renderer3d.domElement);
	document.getElementById('playground-canvas2d').appendChild(renderer2d.domElement);
    camera3d.position.set(0, 0, 3);
	camera2d.position.set(-6, 0, 7);
    circlesGeometry = new THREE.CircleGeometry(0.05);
	sphereGeometry = new THREE.SphereGeometry( 0.02, 32, 32 );
	renderer3d.render(scene3d, camera3d);
	renderer2d.render(scene2d, camera2d);
}
var animate = function () {
    requestAnimationFrame(animate);
	renderer3d.render(scene3d, camera3d);
	renderer2d.render(scene2d, camera2d);
    if (count < steps && !paused) {
		tsne2d.step();
        count++;
        $('#step').text(count);
		var solution2d = tsne2d.getSolution().map(function (coords, i) {
            return new Point(coords);
        });
        for (var iterator = 0; iterator < solution2d.length; iterator++) {
			stars2d[iterator].position.x = solution2d[iterator].coords[0]/4 * ratio;
            stars2d[iterator].position.y = solution2d[iterator].coords[1]/4 * ratio;
        }
    }

};

function reset() {
    paused = true;
	tsne2d = new tsnejs.tSNE(opt2d); // create a tSNE instance
	tsne2d.initDataDist(dists);
    paused = false;
    count = 0;
}

function onParamsChange() {
    var epsilon = $('#epsilon').val();
    var perplexity = $('#perplexity').val();
    var pointsPerSide = $('#pointsPerSide').val();
    var nbSteps = $('#steps').val();
    $('#tsne-options > span.slider-value-Perplexity').text(perplexity);
    $('#tsne-options > span.slider-value-Epsilon').text(epsilon);
    $('#data-options > span.steps-value-Points').text(nbSteps);
	opt2d = {
        epsilon: $('#epsilon').val(), // epsilon is learning rate (5 = default)
        perplexity: $('#perplexity').val(), // roughly how many neighbors each point influences (30 = default)
        dim: 2 // dimensionality of the embedding (3 = default)
    }
    paused = true;
    circlesGeometry = new THREE.CircleGeometry(0.1);
    stars2d = [];
	clearScene2();
    initPoints(datapoints, opt2d, false);
    count = 0;
    steps = nbSteps;
    paused = false;
}

function clearScene3() {
    var to_remove1 = [];

    scene3d.traverse(function (child) {
        to_remove1.push(child);
    });

    for (var i = 0; i < to_remove1.length; i++) {
        scene3d.remove(to_remove1[i]);
    }
}
function clearScene2() {
	var to_remove2 = [];

    scene2d.traverse(function (child) {
        to_remove2.push(child);
    });

    for (var i = 0; i < to_remove2.length; i++) {
        scene2d.remove(to_remove2[i]);
    }
}

function playPause() {

    if (paused) {
        $('#play-pause').removeClass('playing');
        $('#play-pause').addClass('paused');

    } else {
        $('#play-pause').removeClass('paused');
        $('#play-pause').addClass('playing');

    }
    paused = !paused;
}

/******************************************************************/
$(document).ready(function () {
    $('.demo-data').each(function () {
        var ctx = $(this).children('canvas')[0].getContext("2d");
        var img = document.getElementById(this.getAttribute('data-type'));
        ctx.drawImage(img, 0, 0, 150, 150)
    });
    initScene();
});
/******************************************************************/
