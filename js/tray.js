var trayTsne;
var trayScene;
var trayDists;
var trayStars = [];
var trayRenderer;
var trayCamera;
var trayControls;
var trayStarsGeometry;
var trayCubesGeometry;
var trayCount = 0;
var trayPaused = false;
var traySteps = 1000;
var trayNbPoints = 50;
var trayRatio = 1;
var trayThreeD = true;
var trayProfile;

var trayOpt = {
    epsilon: 5, // epsilon is learning rate (10 = default)
    perplexity: 30, // roughly how many neighbors each point influences (30 = default)
    dim: 3 // dimensionality of the embedding (2 = default)
}

// Our Javascript will go here.
function initTrayPoints(nbPoints, opt, profile, threeDModel) {

    var points = profile.getPoints(nbPoints, threeDModel);
    trayDists = distanceMatrix(points);
    trayTsne = new tsnejs.tSNE(opt); // create a tSNE instance
    trayTsne.initDataDist(trayDists);
    if (threeDModel) {
        for (var i = 0; i < points.length; i++) {
            var color = points[i].color;
            var material = new THREE.MeshBasicMaterial({color: color});
            var mesh = new THREE.Mesh(trayCubesGeometry, material);
            mesh.position.x = points[i].coords[0] * trayRatio;
            mesh.position.y = points[i].coords[1] * trayRatio;
            mesh.position.z = points[i].coords[2] * trayRatio;
            trayStars.push(mesh);
            trayScene.add(mesh);
        }
    } else {
        for (var i = 0; i < points.length; i++) {
            var star = new THREE.Vector3();
            star.x = points[i].coords[0] * trayRatio;
            star.y = points[i].coords[1] * trayRatio;
            star.z = 0;
            trayStarsGeometry.vertices.push(star);
            var color = points[i].color;
            var texture = new THREE.TextureLoader().load('textures/circle.png');
            var starsMaterial = new THREE.PointsMaterial({
                size: 0.5,
                color: color,
                map: texture,
                transparent: true,
                depthWrite: false
            });
            var starField = new THREE.Points(trayStarsGeometry, starsMaterial);
            trayStars.push(starField);
            trayScene.add(starField);
        }
    }


}

function initTrayScene() {
    trayScene = new THREE.Scene();
    trayScene.background = new THREE.Color(0XFFFFFF);
    trayCamera = new THREE.PerspectiveCamera(75, 1, 1, 1000);
    trayRenderer = new THREE.WebGLRenderer();
    trayControls = new THREE.OrbitControls(trayCamera, trayRenderer.domElement);
    trayRenderer.setClearColor(0xffffff, 0);
    trayRenderer.setSize(350, 350);
    document.getElementById('tray-content').appendChild(trayRenderer.domElement);
    trayCamera.position.set(0, 0, 20);
    trayStarsGeometry = new THREE.Geometry();
    trayCubesGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);

}

var id;
var trayAnimate = function () {
    id = requestAnimationFrame(trayAnimate);
    if (trayCount < traySteps && !trayPaused) {
        trayTsne.step();
        trayCount++;
        $('#step').text(trayCount)
        var solution = trayTsne.getSolution().map(function (coords, i) {
            return new Point(coords);
        });
        for (var iterator = 0; iterator < solution.length; iterator++) {
            trayStars[iterator].position.x = solution[iterator].coords[0] * trayRatio;
            trayStars[iterator].position.y = solution[iterator].coords[1] * trayRatio;
            trayStars[iterator].position.z = isNaN(solution[iterator].coords[2]) ? 0 : solution[iterator].coords[2];
        }
    }
    trayRenderer.render(trayScene, trayCamera);
};

function clearTrayScene() {
    var to_remove = [];

    trayScene.traverse(function (child) {
        to_remove.push(child);
    });

    for (var i = 0; i < to_remove.length; i++) {
        trayScene.remove(to_remove[i]);
    }
}

var firstRun = true;
$('#tray-close').on('click', function () {
    $('#tray-container').css({top: '-410px'});
    trayPaused = true;
});

function runTray(perplexity, steps, epsilon, nbPoints, profile) {
    trayOpt.perplexity = perplexity;
    trayOpt.epsilon = epsilon;
    traySteps = steps;
    trayProfile = profile;
    trayNbPoints = nbPoints;
    $('#tray-container').css({top: 0});
    if(firstRun) {
        firstRun = false;
        initTrayScene();
        initTrayPoints(trayNbPoints, trayOpt, trayProfile, trayThreeD);
        trayAnimate();
    } else {
        trayPaused = true;
        clearTrayScene();
        trayStarsGeometry = new THREE.Geometry();
        trayCubesGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        trayStars = [];
        initTrayPoints(trayNbPoints, trayOpt, trayProfile, trayThreeD);
        trayCount = 0;
        trayPaused = false;
    }
}