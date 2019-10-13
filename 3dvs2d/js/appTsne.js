/*****************************************************************/
var scene3d, scene2d;
var scene3dElement, scene2dElement;
var stars3d = [];
var stars2d = [];
var renderer3d, renderer2d;
var camera3d, camera2d;
var controls3d, controls2d;
var circlesGeometry;
var cubesGeometry;
var worker3d, worker2d;
var colorsLabels;
var n_samples;
var fileuploaded = false;
function checkfile(sender) {
	var validExt = ".csv";
	var fileExt = sender.value;
	fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
	if (validExt == fileExt) {
		if(fileuploaded){
			clearScene2d();
			clearScene3d();
			stopWorkers();
			resetScenes();
		}	
		else{
			fileuploaded = true;
		}
		read();
	} else {
		fileuploaded = false;
		alert("Invalid file selected, valid files are of " + validExt + " type.");
	}
}
function read() {
	var fr = new FileReader();
	fr.onload = function () {
		document.getElementById('contents').textContent = this.result;
	};
	fr.readAsText(document.getElementById('filechoice').files[0]);
		fr.onload = loadHandler;
};

function loadHandler(event) {
	var csv = event.target.result;
	processData(csv);
}

function processData(csv) {
	var allTextLines = csv.split(/\r\n|\n/);
	var lines = [];
	var labels = [];
	var sampledata = [];
	var details = [];
	var num = 500;//$('#points').val();
	//To make sure the user didn't choose more than the file contains
	if (num > allTextLines.length - 2){
		num = allTextLines.length - 2;
	}
	$('span.slider-value-Points').text(num);
    for (var i = 1; i <= num; i++) {
        var row = allTextLines[i].split(',');
        labels.push(row[0]);
		details.push(row[0]);
        sampledata.push(row.slice(1).map(function (item) {
			return parseFloat(item);
        }));
    }
	SAMPLE_DETAILS = details;
    SAMPLE_DATA = sampledata;
    SAMPLE_LABELS = labels;
    _draw(SAMPLE_DATA, SAMPLE_LABELS, SAMPLE_DETAILS,num, true, 3);
	_draw(SAMPLE_DATA, SAMPLE_LABELS, SAMPLE_DETAILS,num, false, 2);
}
// Our Javascript will go here.
function getRandomColor() {
	var r = Math.floor(Math.random() * 255);
	var g = Math.floor(Math.random() * 255);
	var b = Math.floor(Math.random() * 255);
	var brightness = Trendy.brightness(r,g,b);
	while (brightness < 123) {
		r = Math.floor(Math.random() * 255);
		g = Math.floor(Math.random() * 255);
		b = Math.floor(Math.random() * 255);
		brightness = Trendy.brightness(r,g,b);
	}
	return [r/255,g/255,b/255];
}        
Array.prototype.unique = function () {
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
}
function _draw(SAMPLE_DATA, SAMPLE_LABELS, SAMPLE_DETAILS, num, generatecolor, dim) {
	n_samples = num;
	var sampleLabels = SAMPLE_LABELS;
    var labels = sampleLabels.unique();
	if(generatecolor){
		colorsLabels = [];
		for (var i = 0; i < labels.length; i++) {
			var j = 0;
			var newcolor = getRandomColor();
			while (j < colorsLabels.length) {
				//check if the new color is already in the colorslabels array
				if (_.isEqual(newcolor, colorsLabels.slice(j, j + 3))) {
					j = 0;
					newcolor = getRandomColor();
				} else {
					j = j + 3;
				}
			}
			colorsLabels = colorsLabels.concat(newcolor);
		}
	}
	if(dim == 3)
		draw3d(SAMPLE_DATA, SAMPLE_LABELS, colorsLabels, SAMPLE_DETAILS, n_samples);
	else
		draw2d(SAMPLE_DATA, SAMPLE_LABELS, colorsLabels, SAMPLE_DETAILS, n_samples);
}
function draw3d(SAMPLE_DATA, SAMPLE_LABELS, colorsLabels, SAMPLE_DETAILS, num){
	var sampleData = SAMPLE_DATA;
	var perplexity3d = $('#perplexity3d').val();
    var earlyExaggeration3d = $('#earlyExaggeration3d').val();
    var epsilon3d = $('#epsilon3d').val();
	var nIter3d = $('#steps3d').val();
	worker3d.postMessage({
		type: 'INPUT_DATA',
		data: sampleData
	});
	worker3d.postMessage({
		type: 'RUN',
		data: {
			perplexity: perplexity3d,
			earlyExaggeration: earlyExaggeration3d,
			learningRate: epsilon3d,
			nIter: nIter3d,
		}
	});
    var sampleLabels = SAMPLE_LABELS;
	var sampleDetails = SAMPLE_DETAILS;
    var labels = sampleLabels.unique();
    var info = [];
    var color = new THREE.Color();
    var cubesGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    for (var i = 0; i < num; i++) {
        var label = labels.indexOf(sampleLabels[i]);
        var color = new THREE.Color(colorsLabels[label * 3], colorsLabels[label * 3 + 1], colorsLabels[label * 3 + 2]);
        var material = new THREE.MeshBasicMaterial({color: color});
		//3D
        var mesh = new THREE.Mesh(cubesGeometry, material);
        mesh.position.x = Math.random() * (-2) + 2;
        mesh.position.y = Math.random() * (-2) + 2;
        mesh.position.z = Math.random() * (-2) + 2;
        stars3d.push(mesh);
        scene3d.add(mesh);
    }
}
function draw2d(SAMPLE_DATA, SAMPLE_LABELS, colorsLabels, SAMPLE_DETAILS, num){
    var sampleData = SAMPLE_DATA;
	var perplexity2d = $('#perplexity2d').val();
    var earlyExaggeration2d = $('#earlyExaggeration2d').val();
    var epsilon2d = $('#epsilon2d').val();
	var nIter2d = $('#steps2d').val();
	worker2d.postMessage({
		type: 'INPUT_DATA',
		data: sampleData
	});
	worker2d.postMessage({
		type: 'RUN',
		data: {
			perplexity: perplexity2d,
			earlyExaggeration: earlyExaggeration2d,
			learningRate: epsilon2d,
			nIter: nIter2d,
		}
	});
    var sampleLabels = SAMPLE_LABELS;
	var sampleDetails = SAMPLE_DETAILS;
    var labels = sampleLabels.unique();
    var info = [];
    var color = new THREE.Color();
	var circlesGeometry = new THREE.CircleGeometry(0.03);
    for (var i = 0; i < num; i++) {
        var label = labels.indexOf(sampleLabels[i]);
        var color = new THREE.Color(colorsLabels[label * 3], colorsLabels[label * 3 + 1], colorsLabels[label * 3 + 2]);
        var material = new THREE.MeshBasicMaterial({color: color});
		//2D
		var mesh2d = new THREE.Mesh(circlesGeometry, material);
        mesh2d.position.x = Math.random() * (-2) + 2;
        mesh2d.position.y = Math.random() * (-2) + 2;
        mesh2d.position.z = 0;
        stars2d.push(mesh2d);
        scene2d.add(mesh2d);
    }
}
function resetScenes(){
	renderer3d.render(scene3d, camera3d);
	renderer2d.render(scene2d, camera2d);
	worker3d = new Worker('js/worker3d.js');
	worker2d = new Worker('js/worker2d.js');
	worker3d.onmessage = function (e) {
        var msg = e.data;
        switch (msg.type) {
          case 'PROGRESS_STATUS':
            $('#progress-status3d').text(msg.data);
            break;
          case 'PROGRESS_ITER':
			showProgress3d();
            $('#progress-iter3d').text(msg.data[0] + 1);
            $('#progress-error3d').text(msg.data[1].toPrecision(7));
            $('#progress-gradnorm3d').text(msg.data[2].toPrecision(5));
            break;
            case 'PROGRESS_DATA':
                drawUpdate3d(msg.data);
                break;
            case 'DONE':
                drawUpdate3d(msg.data);
                break;
            default:
        }
    }
	worker2d.onmessage = function (e) {
        var msg = e.data;
        switch (msg.type) {
          case 'PROGRESS_STATUS':
            $('#progress-status2d').text(msg.data);
            break;
          case 'PROGRESS_ITER':
			showProgress2d();
            $('#progress-iter2d').text(msg.data[0] + 1);
            $('#progress-error2d').text(msg.data[1].toPrecision(7));
            $('#progress-gradnorm2d').text(msg.data[2].toPrecision(5));
            break;
            case 'PROGRESS_DATA':
                drawUpdate2d(msg.data);
                break;
            case 'DONE':
                drawUpdate2d(msg.data);
                break;
            default:
        }
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
    camera3d.position.set(-1, 0, 4);
	camera2d.position.set(-1, 0, 4);
    circlesGeometry = new THREE.CircleGeometry(0.1);
    cubesGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
	renderer3d.render(scene3d, camera3d);
	renderer2d.render(scene2d, camera2d);
	worker3d = new Worker('js/worker3d.js');
	worker2d = new Worker('js/worker2d.js');
	worker3d.onmessage = function (e) {
        var msg = e.data;
        switch (msg.type) {
          case 'PROGRESS_STATUS':
            $('#progress-status3d').text(msg.data);
            break;
          case 'PROGRESS_ITER':
			showProgress3d();
            $('#progress-iter3d').text(msg.data[0] + 1);
            $('#progress-error3d').text(msg.data[1].toPrecision(7));
            $('#progress-gradnorm3d').text(msg.data[2].toPrecision(5));
            break;
            case 'PROGRESS_DATA':
                drawUpdate3d(msg.data);
                break;
            case 'DONE':
                drawUpdate3d(msg.data);
				worker2d.terminate();
                break;
            default:
        }
    }
	worker2d.onmessage = function (e) {
        var msg = e.data;
        switch (msg.type) {
          case 'PROGRESS_STATUS':
            $('#progress-status2d').text(msg.data);
            break;
          case 'PROGRESS_ITER':
			showProgress2d();
            $('#progress-iter2d').text(msg.data[0] + 1);
            $('#progress-error2d').text(msg.data[1].toPrecision(7));
            $('#progress-gradnorm2d').text(msg.data[2].toPrecision(5));
            break;
            case 'PROGRESS_DATA':
                drawUpdate2d(msg.data);
                break;
            case 'DONE':
                drawUpdate2d(msg.data);
				worker2d.terminate();
                break;
            default:
        }
    }
}
    function showProgress3d() { 
        if(document.getElementById('iter3d').style.display=='none') { 
            document.getElementById('iter3d').style.display='block'; 
			document.getElementById('error3d').style.display='block'; 
			document.getElementById('gradnorm3d').style.display='block'; 
        } 
        return false;
    } 
	function showProgress2d() { 
        if(document.getElementById('iter2d').style.display=='none') { 
            document.getElementById('iter2d').style.display='block'; 
			document.getElementById('error2d').style.display='block'; 
			document.getElementById('gradnorm2d').style.display='block'; 
        } 
        return false;
    }
function scale (value, median, q1, q3){
	return (value - median)/(q3-q1);
}
function drawUpdate3d(embedding) {
	var xcolumn = embedding.map(function(value,index) { return value[0]; });
	//var xq1 = d3.quantile(xcolumn,0.25);
	//var xq3 = d3.quantile(xcolumn,0.75);
	//var xmedian = d3.median(xcolumn);
	var xmin = d3.min(xcolumn);
	var xmax = d3.max(xcolumn);
	var ycolumn = embedding.map(function(value,index) { return value[1]; });
	//var yq1 = d3.quantile(ycolumn,0.25);
	//var yq3 = d3.quantile(ycolumn,0.75);
	//var ymedian = d3.median(ycolumn);
	var ymin = d3.min(ycolumn);
	var ymax = d3.max(ycolumn);
	var zcolumn = embedding.map(function(value,index) { return value[2]; });
	//var zq1 = d3.quantile(zcolumn,0.25);
	//var zq3 = d3.quantile(zcolumn,0.75);
	//var zmedian = d3.median(zcolumn);
	var zmin = d3.min(zcolumn);
	var zmax = d3.max(zcolumn);
	const linearScaleX = d3.scaleLinear()
    .domain([xmin, xmax])
    .range([-2, 2]);
	const linearScaleY = d3.scaleLinear()
    .domain([ymin, ymax])
    .range([-2, 2]);
	const linearScaleZ = d3.scaleLinear()
    .domain([zmin, zmax])
    .range([-2, 2]);
    for (var i = 0; i < embedding.length; i++) {
		// positions
		var x = embedding[i][0];
        var y = embedding[i][1];
        var z = embedding[i][2];
        //var x = linearScaleX(embedding[i][0]);
        //var y = linearScaleY(embedding[i][1]);
        //var z = linearScaleZ(embedding[i][2]);
        stars3d[i].position.x = x;
        stars3d[i].position.y = y;
        stars3d[i].position.z = z;
    }
    renderer3d.render(scene3d, camera3d);
};
function drawUpdate2d(embedding) {
	var xcolumn = embedding.map(function(value,index) { return value[0]; });
	var xmin = d3.min(xcolumn);
	var xmax = d3.max(xcolumn);
	var ycolumn = embedding.map(function(value,index) { return value[1]; });
	var ymin = d3.min(ycolumn);
	var ymax = d3.max(ycolumn);
	const linearScaleX = d3.scaleLinear()
    .domain([xmin, xmax])
    .range([-2, 2]);
	const linearScaleY = d3.scaleLinear()
    .domain([ymin, ymax])
    .range([-2, 2]);
    for (var i = 0; i < embedding.length; i++) {
		// positions
        var x = linearScaleX(embedding[i][0]);
        var y = linearScaleY(embedding[i][1]);
        stars2d[i].position.x = x;
        stars2d[i].position.y = y;
    }
    renderer2d.render(scene2d, camera2d);
};
function onParamsChange() {
	if(fileuploaded){
		clearScene2d();
		clearScene3d();
		stopWorkers();
		resetScenes();
		read();
	}	
}
function stopWorkers() {
    worker3d.terminate();
	worker2d.terminate();
	worker3d = new Worker('js/worker3d.js');
	worker2d = new Worker('js/worker2d.js');
}
function onParamsChange3d() {
    var epsilon3d = $('#epsilon3d').val();
    var perplexity3d = $('#perplexity3d').val();
    var nIter3d = $('#steps3d').val();
	var earlyExaggeration3d = $('#earlyExaggeration3d').val();
    $('#tsne-options > span.slider-value-Perplexity3d').text(perplexity3d);
    $('#tsne-options > span.slider-value-Epsilon3d').text(epsilon3d);
    $('#data-options > span.steps-value-Points3d').text(nIter3d);
	$('#tsne-options > span.slider-value-earlyExaggeration3d').text(earlyExaggeration3d);
    clearScene3d();
	draw3d(SAMPLE_DATA, SAMPLE_LABELS, colorsLabels, SAMPLE_DETAILS, n_samples);
}
function onParamsChange2d() {
    var epsilon2d = $('#epsilon2d').val();
    var perplexity2d = $('#perplexity2d').val();
    var nIter2d = $('#steps2d').val();
	var earlyExaggeration2d = $('#earlyExaggeration2d').val();
    $('#tsne-options > span.slider-value-Perplexity2d').text(perplexity2d);
    $('#tsne-options > span.slider-value-Epsilon2d').text(epsilon2d);
    $('#data-options > span.steps-value-Points2d').text(nIter2d);
	$('#tsne-options > span.slider-value-earlyExaggeration2d').text(earlyExaggeration2d);
    clearScene2d();
	draw2d(SAMPLE_DATA, SAMPLE_LABELS, colorsLabels, SAMPLE_DETAILS, n_samples);
}
function clearScene3d() {
	stars3d = [];
    var to_remove1 = [];

    scene3d.traverse(function (child) {
        to_remove1.push(child);
    });

    for (var i = 0; i < to_remove1.length; i++) {
        scene3d.remove(to_remove1[i]);
    }
}
function clearScene2d() {
	stars2d = [];
	var to_remove2 = [];

    scene2d.traverse(function (child) {
        to_remove2.push(child);
    });

    for (var i = 0; i < to_remove2.length; i++) {
        scene2d.remove(to_remove2[i]);
    }
}
$('.demo-data').on('click', function () {
    $('.demo-data').removeClass('selected');
    this.className += ' selected';
    onParamsChange();
});

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
