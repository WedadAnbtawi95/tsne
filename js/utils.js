// Euclidean distance.
function dist(a, b) {
    var d = 0;
    for (var i = 0; i < a.length; i++) {
        d += (a[i] - b[i]) * (a[i] - b[i]);
    }
    return Math.sqrt(d);
}

// Creates distance matrix for t-SNE input.
function distanceMatrix(points) {
    var matrix = [];
    var n = points.length;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            matrix.push(dist(points[i].coords,
                points[j].coords));
        }
    }
    return matrix;
}
// Gaussian generator, mean = 0, std = 1.
var normal = d3.randomNormal();
// Create random Gaussian vector.
function normalVector(dim) {
    var p = [];
    for (var j = 0; j < dim; j++) {
        p[j] = normal();
    }
    return p;
}
// Scale the given vector.
function scale(vector, a) {
    for (var i = 0; i < vector.length; i++) {
        vector[i] *= a;
    }
}
var Point = function (coords, color) {
    this.coords = coords;
    this.color = color || '#039';
};

function makePoints(originals) {
    var points = originals.map(function (p) {
        return new Point(p);
    });
    //addSpatialColors(points);
    return points;
}

// Return a color for the given angle.
function angleColor(t) {
    var hue = ~~(300 * t / (2 * Math.PI));
    return 'hsl(' + hue + ',50%,50%)';
}
// Data in shape of 2D grid.
function gridData(size, threeModel, dim) {
    var points = [];
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            if (threeModel) {
                for (var z = 0; z < size; z++) {
                    points.push([x, y, z]);
                }
            } else {
                points.push([x, y, 0]);
            }
        }
    }
    return makePoints(points);
}
// Two clusters of the same size.
function twoClustersData(n, threeDModel, dim) {
    dim = dim || 50;
    var points = [];
    for (var i = 0; i < n; i++) {
        points.push(new Point(normalVector(dim), '#039'));
        var v = normalVector(dim);
        v[0] += 10;
        points.push(new Point(v, '#f90'));
    }
    return points;
}

// Three clusters, at different distances from each other, in any dimension.
function threeClustersData(n, threeDModel, dim) {
    dim = dim || 50;
    var points = [];
    for (var i = 0; i < n; i++) {
        var p1 = normalVector(dim);
        points.push(new Point(p1, '#039'));
        var p2 = normalVector(dim);
        p2[0] += 10;
        points.push(new Point(p2, '#f90'));
        var p3 = normalVector(dim);
        p3[0] += 30;
        points.push(new Point(p3, '#6a3'));
    }
    return points;
}
// One tiny cluster inside of a big cluster.
function subsetClustersData(n, threeDModel, dim) {
    dim = dim || 50;
    var points = [];
    for (var i = 0; i < n; i++) {
        var p1 = normalVector(dim);
        points.push(new Point(p1, '#039'));
        var p2 = normalVector(dim);
        scale(p2, 20);
        points.push(new Point(p2, '#f90'));
    }
    return points;
}
// Points in two unlinked rings.
function unlinkData(n, threeDModel, dim) {
    var points = [];
    function rotate(x, y, z) {
        var u = x;
        var cos = Math.cos(.4);
        var sin = Math.sin(.4);
        var v = cos * y + sin * z;
        var w = -sin * y + cos * z;
        return [u, v, w];
    }
    for (var i = 0; i < n; i++) {
        var t = 2 * Math.PI * i / n;
        var sin = Math.sin(t);
        var cos = Math.cos(t);
        // Ring 1.
        points.push(new Point(rotate(cos, sin, 0), '#f90'));
        // Ring 2.
        points.push(new Point(rotate(3 + cos, 0, sin), '#039'));
    }
    return points;
}
// Points in linked rings.
function linkData(n, threeDModel, dim) {
    var points = [];
    function rotate(x, y, z) {
        var u = x;
        var cos = Math.cos(.4);
        var sin = Math.sin(.4);
        var v = cos * y + sin * z;
        var w = -sin * y + cos * z;
        return [u, v, w];
    }
    for (var i = 0; i < n; i++) {
        var t = 2 * Math.PI * i / n;
        var sin = Math.sin(t);
        var cos = Math.cos(t);
        // Ring 1.
        points.push(new Point(rotate(cos, sin, 0), '#f90'));
        // Ring 2.
        points.push(new Point(rotate(1 + cos, 0, sin), '#039'));
    }
    return points;
}
// Points in a trefoil knot.
function trefoilData(n, threeDModel, dim) {
    var points = [];
    for (var i = 0; i < n; i++) {
        var t = 2 * Math.PI * i / n;
        var x = Math.sin(t) + 2 * Math.sin(2 * t);
        var y = Math.cos(t) - 2 * Math.cos(2 * t);
        var z = -Math.sin(3 * t);
        points.push(new Point([x, y, z], angleColor(t)));
    }
    return points;
}