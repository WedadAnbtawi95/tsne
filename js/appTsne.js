/*****************************************************************/
var scene;
var tsne;
var dists;
var stars = [];
var renderer;
var camera;
var controls;
var starsGeometry;
var cubesGeometry;
var count = 0;
var paused = false;
var steps = 200;
var nbPoints = 8;
var ratio = 0.65;
var threeD = true;
var profile = profiles['square'];
var opt = {
    epsilon: 5, // epsilon is learning rate (10 = default)
    perplexity: 30, // roughly how many neighbors each point influences (30 = default)
    dim: 3 // dimensionality of the embedding (2 = default)
}

// Our Javascript will go here.
function initPoints(nbPoints, opt, profile, threeDModel) {
	if ((profile === profiles['sphere'])|| (profile === profiles['torus'])||(profile === profiles['tetrahedron'])){
		read(nbPoints, profile, opt);
	}	
    else{
		var points = profile.getPoints(nbPoints, threeDModel);
		dists = distanceMatrix(points);
		tsne = new tsnejs.tSNE(opt); // create a tSNE instance
		tsne.initDataDist(dists);
		for (var i = 0; i < points.length; i++) {
			var color = points[i].color;
			var material = new THREE.MeshBasicMaterial({color: color});
			var mesh = new THREE.Mesh(cubesGeometry, material);
			mesh.position.x = points[i].coords[0] * ratio;
			mesh.position.y = points[i].coords[1] * ratio;
			mesh.position.z = points[i].coords[2] * ratio;
			stars.push(mesh);
			scene.add(mesh);
		}
	}

}
function initPointsfromFile(points, opt) {
    dists = distanceMatrix(points);
    tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataDist(dists);
    for (var i = 0; i < points.length; i++) {
        var color = points[i].color;
        var material = new THREE.MeshBasicMaterial({color: color});
        var mesh = new THREE.Mesh(cubesGeometry, material);
        mesh.position.x = points[i].coords[0] * ratio;
        mesh.position.y = points[i].coords[1] * ratio;
        mesh.position.z = points[i].coords[2] * ratio;
        stars.push(mesh);
        scene.add(mesh);
    }
}
function read(nbPoints, profile, opt){
	if(profile === profiles['sphere']){
		path = "data/sphere.csv";
	}
	else if (profile === profiles['torus']){
		path = "data/torus.csv";
	}
	else{
		path = "data/tetrahedron.csv";
	}
	d3.text(path, function(text) {
		var countrow = 0;
		var data = [];
		d3.csvParseRows(text).map(function(row) {
			countrow++;
			if (countrow <= nbPoints) data.push(row.map(function(value) {
				return +value;
			}));
		});
		initPointsfromFile(makePoints(data), opt);
	});
}

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0XFFFFFF);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    renderer = new THREE.WebGLRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(window.innerWidth / 2, 500);
    document.getElementById('playground-canvas').appendChild(renderer.domElement);
    camera.position.set(0, 0, 10);
    starsGeometry = new THREE.Geometry();
    cubesGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);

}

var animate = function () {


    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if (count < steps && !paused) {
        tsne.step();
        count++;
        $('#step').text(count);
        var solution = tsne.getSolution().map(function (coords, i) {
            return new Point(coords);
        });

        for (var iterator = 0; iterator < solution.length; iterator++) {
            stars[iterator].position.x = solution[iterator].coords[0] * ratio;
            stars[iterator].position.y = solution[iterator].coords[1] * ratio;
            stars[iterator].position.z = solution[iterator].coords[2] * ratio;
        }
    }

};

function reset() {
    paused = true;
    tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataDist(dists);
    paused = false;
    count = 0;
}

function onParamsChange() {
    var epsilon = $('#epsilon').val();
    var perplexity = $('#perplexity').val();
    var pointsPerSide = $('#pointsPerSide').val();
    var nbSteps = $('#steps').val();
    pointsPerSide = (pointsPerSide > 8 && profile === profiles['square']) ? 8 : pointsPerSide;
    pointsPerSide = (pointsPerSide < 20 && !(profile === profiles['square'])) ? 20 : pointsPerSide;
    pointsPerSide = (pointsPerSide < 35 && profile === profiles['trefoil']) ? 35 : pointsPerSide;
	pointsPerSide = (pointsPerSide > 200 && (profile === profiles['sphere'])) ? 200 : pointsPerSide;
	pointsPerSide = (pointsPerSide < 50 && ((profile === profiles['sphere'])|| (profile === profiles['torus'])||(profile === profiles['tetrahedron']))) ? 50 : pointsPerSide;
    var threeDModel = true;
    $('#data-options > span.slider-value-Points').text(pointsPerSide);
    $('#tsne-options > span.slider-value-Perplexity').text(perplexity);
    $('#tsne-options > span.slider-value-Epsilon').text(epsilon);
    $('#data-options > span.steps-value-Points').text(nbSteps);

    opt = {
        epsilon: $('#epsilon').val(), // epsilon is learning rate (5 = default)
        perplexity: $('#perplexity').val(), // roughly how many neighbors each point influences (30 = default)
        dim: 3 // dimensionality of the embedding (3 = default)
    }
    paused = true;
    clearScene();
    starsGeometry = new THREE.Geometry();
    cubesGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    stars = [];
    setDescription(profile);
    initPoints(pointsPerSide, opt, profile, threeDModel);
    count = 0;
    steps = nbSteps;
    paused = false;
}

function clearScene() {
    var to_remove = [];

    scene.traverse(function (child) {
        to_remove.push(child);
    });

    for (var i = 0; i < to_remove.length; i++) {
        scene.remove(to_remove[i]);
    }
}

function setDescription(profile) {
    $('#description').text(profile.description);
}

$('.demo-data').on('click', function () {
    $('.demo-data').removeClass('selected');
    this.className += ' selected';
    profile = profiles[this.getAttribute('data-type')];
    onParamsChange();
});

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
    setDescription(profile);
    initPoints(nbPoints, opt, profile, threeD);
    animate();
});
/******************************************************************/
