'use strict';

angular.module('components', []);

angular.module('components').component('graph', {
    templateUrl: '/html/graph.html',
    controller: ['$http', '$scope', '$rootScope',
        function ($http, $scope, $rootScope) {

            var layout = undefined, elementsRemoved = undefined, graph = undefined, layoutProps = {name: 'cola'};
            $scope.badges = [];

            this.$onInit = function () {
                $http.get('/nodes', {
                    headers: {Accept: 'application/json'},
                    responseType: 'json'
                }).then(function (response) {
                    graph = createGraph(response.data.nodes, response.data.relationships);
                }, function errorCallback(response) {
                    // if (GexUtils.isResponseCanceled(response)) {
                    //     return;
                    // }
                    // GexUtils.redirectIfSomeRespCodes(response);
                    //todo show error
                });
            };

            function createGraph(nodes, relationships) {
                var newElems = [];
                nodes.forEach(function (element) {
                    newElems.push(createCytoscapeNode(element));
                });
                relationships.forEach(function (element) {
                    newElems.push(createCytoscapeEdge(element));
                });

                var graph = cytoscape({
                    container: document.getElementById('graph'),
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'background-color': function (ele) {
                                    return ele.data('color');
                                },
                                'label': function (ele) {
                                    return ele.data('label');
                                },
                                'text-valign': 'center',
                                'font-size': '5pt',
                                'text-wrap': 'wrap',
                                'text-max-width': 25,
                                'color': function (ele) {
                                    return ele.data('textColor');
                                }
                            }
                        },

                        {
                            selector: 'edge',
                            style: {
                                'width': 3,
                                'line-color': '#ccc',
                                'target-arrow-color': '#ccc',
                                'target-arrow-shape': 'triangle',
                                'curve-style': 'bezier',
                                'label': function (ele) {
                                    return ele.data('label');
                                },
                                'text-rotation': 'autorotate',
                                'font-size': '5pt'
                            }
                        }
                    ],

                    elements: newElems
                });
                layout = graph.layout(layoutProps);
                layout.run();

                elementsRemoved = false;
                graph.on('tap', 'node', function (evt) {
                    var node = evt.target;
                    $scope.$apply(function () {
                        $rootScope.$emit('showNodeInfoLeft', {id: node.data('el').id});
                        if (!elementsRemoved) {
                            deleteNodesExceptNeighbours(node.data('id'));
                        } else {
                            addNodeWithNeighbours(node.data('el').id);
                        }
                    });
                });

                return graph;
            }

            function deleteNodesExceptNeighbours(nodeId) {
                var node = graph.getElementById(nodeId);
                addNodeBadge(node);
                var ids = [node.data('id')];
                node.neighborhood().forEach(function (elem) {
                    ids.push(elem.data('id'));
                });
                var elementToRemove = graph.filter(function (elem) {
                    return ids.indexOf(elem.data('id')) < 0
                });

                layout.stop();
                graph.remove(elementToRemove);
                layout = graph.layout(layoutProps);
                layout.run();
                elementsRemoved = true;
            }

            function addNodeWithNeighbours(inNodeId) {
                var nodeInGraph = false;

                var allNodesIds = _.map(graph.nodes(), function (elem) {
                    if (elem.isNode()) {
                        if (elem.data('el').id === inNodeId) {
                            nodeInGraph = true;
                        }
                        return elem.data('el').id;
                    } else {
                        return undefined;
                    }
                });

                $http.get('/nodes/' + inNodeId + '/neighbours', {
                    headers: {Accept: 'application/json'},
                    responseType: 'json',
                    params: {'loadedNodesIds': JSON.stringify(allNodesIds)}
                }).then(function (response) {
                    var newElements = [];
                    response.data.neighbours.forEach(function (element) {
                        newElements.push(createCytoscapeNode(element));
                    });
                    response.data.relationships.forEach(function (element) {
                        newElements.push(createCytoscapeEdge(element));
                    });
                    if (!nodeInGraph) {
                        newElements.push(createCytoscapeNode(response.data.node));
                    }

                    if (newElements.length > 0) {
                        layout.stop();
                        graph.add(newElements);
                        layout = graph.layout(layoutProps);
                        layout.run();
                    }
                    addNodeBadge(graph.getElementById('n' + inNodeId));
                }, function errorCallback(response) {
                    // if (GexUtils.isResponseCanceled(response)) {
                    //     return;
                    // }
                    // GexUtils.redirectIfSomeRespCodes(response);

                    // todo show error
                });
            }

            $scope.deleteNodeWithNeighbours = function (node) {
                var ids = [];
                if ($scope.badges.length === 1) {
                    $scope.resetGraph();
                    return;
                }

                for (var i = $scope.badges.length - 1; i >= 0; i--) {
                    var badgeId = $scope.badges[i].data('id');
                    if (badgeId === node.data('id')) {
                        $scope.badges.splice(i, 1);
                        continue;
                    }
                    ids.push(badgeId);

                    graph.getElementById(badgeId).neighborhood().forEach(function (elem) {
                        ids.push(elem.data('id'));
                    });
                }

                var elementToRemove = graph.filter(function (elem) {
                    return ids.indexOf(elem.data('id')) < 0
                });

                layout.stop();
                graph.remove(elementToRemove);
                layout = graph.layout(layoutProps);
                layout.run();
            };

            $scope.resetGraph = function () {
                $rootScope.$emit('showSearchLeft', {reset: true});
                if (graph) {
                    elementsRemoved = false;
                    $scope.badges.length = 0;

                    $http.get('/nodes', {
                        headers: {Accept: 'application/json'},
                        responseType: 'json'
                    }).then(function (response) {
                        var newElems = [];
                        response.data.nodes.forEach(function (element) {
                            newElems.push(createCytoscapeNode(element));
                        });
                        response.data.relationships.forEach(function (element) {
                            newElems.push(createCytoscapeEdge(element));
                        });
                        layout.stop();
                        graph.add(newElems);
                        layout = graph.layout(layoutProps);
                        layout.run();
                    }, function errorCallback(response) {
                        // if (GexUtils.isResponseCanceled(response)) {
                        //     return;
                        // }
                        // GexUtils.redirectIfSomeRespCodes(response);

                        //todo shoe error
                    });
                }
            };

            function addNodeBadge(node) {
                if ($scope.badges.length > 0) {
                    for (var i = 0; i < $scope.badges.length; i++) {
                        if ($scope.badges[i].data('id') === node.data('id')) {
                            return;
                        }
                    }
                }

                $scope.badges.push(node);
            }

            function hexToRgb(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }

            function needWhiteLabel(color) {
                return ((color.r * 299 + color.g * 587 + color.b * 114) / 1000) < 123;
            }

            function getInNodeLabel(node) {
                return node.properties.name ? node.properties.name : node.properties.title;
            }


            function createCytoscapeNode(node) {
                var nodeColor = randomColor({seed: node.types[0]});
                var textColor = needWhiteLabel(hexToRgb(nodeColor)) ? '#ffffff' : '#000000';

                return {
                    group: 'nodes',
                    data: {
                        id: 'n' + node.id,
                        color: nodeColor,
                        label: getInNodeLabel(node),
                        textColor: textColor,
                        el: node
                    }
                };
            }

            function createCytoscapeEdge(relationship) {
                return {
                    group: 'edges',
                    data: {
                        id: 'e' + relationship.id,
                        source: 'n' + relationship.source,
                        target: 'n' + relationship.target,
                        label: relationship.type,
                        el: relationship
                    }
                };
            }

            var addNodeEvent = $rootScope.$on('addNodeWithNeighbours', function (event, data) {
                var node = data.node;
                if (!elementsRemoved) {
                    deleteNodesExceptNeighbours('n' + node.id);
                } else {
                    addNodeWithNeighbours(node.id);
                }
            });

            $scope.$on('$destroy', addNodeEvent);
        }
    ]
});