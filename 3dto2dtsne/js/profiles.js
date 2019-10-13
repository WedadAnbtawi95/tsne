var profiles = {
    square: {
        getPoints: gridData,
        description: 'A grid cube with equal spacing between points.'
    },
    twoClusters: {
        getPoints: twoClustersData,
        description: 'Two clusters with equal numbers of points but with different distance from each other in high dimension.'
    },
    threeClusters: {
        getPoints: threeClustersData,
        description: 'Three clusters with equal numbers of points but with different distance from each other in high dimension.'
    },
    subsetClusters: {
        getPoints: subsetClustersData,
        description: 'A dense, tight cluster is a subset of a wide, sparse cluster. Perplexity makes a big difference here.'
    },
    unlink: {
        getPoints: unlinkData,
        description: 'Points arranged in 3D forming two unlinked circles. Different perplexity values will give different result.'
    },
    link: {
        getPoints: linkData,
        description: 'Points arranged in 3D forming two linked circles. Different perplexity values will give different result.'
    },
    trefoil: {
        getPoints: trefoilData,
        description: 'Points giving a trefoil knot topology in 3D. Different perplexity values will give different result.'
    }
}