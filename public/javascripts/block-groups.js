/**
 * Created by JMartinez on 5/21/2015.
 */

//var pg = require('pg');
//var conString = "postgres://postgres:postgres@localhost/postgres"

app.controller('block-groups-ctrl', function($scope, $http){

    //scope variables

    $scope.dataTable = ['Demographics', 'Income'];
    $scope.selectedDataTable = $scope.dataTable[0];


    //get input control data

    $scope.$watch('selectedDataTable', function(nv,ov){
        if($scope.selectedDataTable == 'Demographics'){
            //request demographic input control data
            $http.get('/races')
                .success(function(response){
                    var out = [];
                    response.forEach(function(cv, index, arr){
                        out.push(cv.race);
                    });
                    $scope.categories = out;
                });
            $http.get('/age-sex-grp')
                .success(function(response){
                    var out = [];
                    response.forEach(function(cv, index, arr){
                        out.push(cv.age_sex_grp);
                    });
                    $scope.ageGrp = out;
                });

        }
        else{
            //request income input control data
            $http.get('/income-grp')
                .success(function(response){
                    var out = [];
                    response.forEach(function(cv, index, arr){
                        out.push(cv.income_grp);
                    });
                    $scope.categories = out;
                });
            $http.get('/age-grp')
                .success(function(response){
                    var out = [];
                    response.forEach(function(cv, index, arr){
                        out.push(cv.age_grp);
                    });
                    $scope.ageGrp = out;
                });
        }

    })


    $scope.query = function(){
       if($scope.selectedDataTable === 'Demographics'){
           var dataToSend = {race: $scope.selectedCategory, ageGrp: $scope.selectedAgeGrp};

           $http.post('/query-demographics', dataToSend)
               .success(function(response){
                   colorMap(response); //call d3 function that will color map
               })

       }
        else{
           var dataToSend = {race: $scope.selectedCategory, ageGrp: $scope.selectedAgeGrp};

           $http.post('/query-income', dataToSend)
               .success(function(response){
                   colorMap(response); //call d3 function that will color map
               })
       }

    }

    //build map
    var map = L.map('mapCanvas').setView([39.75, -104.95], 10);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
        draw: {
            position: 'topleft',
            polygon: {
                title: 'Draw a sexy polygon!',
                allowIntersection: false,
                drawError: {
                    color: '#b00b00',
                    timeout: 1000
                },
                shapeOptions: {
                    color: '#bada55'
                },
                showArea: true
            },
            polyline: {
                metric: false
            },
            circle: {
                shapeOptions: {
                    color: '#662d91'
                }
            }
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;

        if (type === 'marker') {
            layer.bindPopup('A popup!');
        }

        drawnItems.addLayer(layer);
    });

    //load data

    function action(){

        queue()
            .defer(d3.json, 'data/block-group.json')
            .await(loadShapes)

    }

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");
    var mapById = d3.map();
    var quantize = d3.scale.quantize()
        .range(d3.range(7).map(function(i){return "q" + i + "-7";}));

    function loadShapes(error, blockGrp){

        var shape = topojson.feature(blockGrp, blockGrp.objects.bg10);

        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var feature = g.selectAll("path")
            .data(shape.features)
            .enter()
            .append("path")
            .attr("class", "block-groups");


        map.on("viewreset", reset);
        reset();

        function reset() {
            var bounds = path.bounds(shape), topLeft = bounds[0],
                bottomRight = bounds[1];

            svg .attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

            g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

            feature.attr("d", path);


        }

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

    }

    action();

    //variables for map classification





});