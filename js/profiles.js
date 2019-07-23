var profiles = {
    square: {
        getPoints: gridData,
        description: 'A grid with equal spacing between points. Try convergence at different sample sizes.'
    },
    twoClusters: {
        getPoints: twoClustersData,
        description: 'Two clusters with equal numbers of points but with different distance from each other in high dimension.'
    },
    threeClusters: {
        getPoints: threeClustersData,
        description: 'Three clusters with equal numbers of points, but at different distances from each other.'
    },
    subsetClusters: {
        getPoints: subsetClustersData,
        description: 'A dense, tight cluster inside of a wide, sparse cluster. Perplexity makes a big difference here.'
    },
    unlink: {
        getPoints: unlinkData,
        description: 'Points arranged in 3D, on two unlinked circles.'
    },
    link: {
        getPoints: linkData,
        description: 'Points arranged in 3D, on two linked circles. Different runs may give different results.'
    },
    trefoil: {
        getPoints: trefoilData,
        description: 'Points arranged in 3D, following a trefoil knot. Different runs may give different results.'
    }
}