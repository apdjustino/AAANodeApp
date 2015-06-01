/**
 * Created by JMartinez on 5/21/2015.
 */

//var pg = require('pg');
//var conString = "postgres://postgres:postgres@localhost/postgres"

app.controller('block-groups-ctrl', function($scope, $http){

    //scope variables

    $scope.dataTable = ['Demographics', 'Income'];
    $scope.selectedDataTable = $scope.dataTable[0];
    $scope.checked = false;
    $scope.routeChecked = false;
    $scope.stopsChecked = false;
    var mapById = d3.map();
    var percent = d3.format(",.1%");


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

    $scope.$watch('checked', function(nv, ov){
        if(nv !== ov){
            if(nv === true){
                addChurches();
            }
            else{
                g.selectAll("circle")
                    .remove();
            }

        }
    })

    $scope.$watch('routeChecked', function(nv, ov){
        if(nv !== ov){
            if(nv === true){
                addRoutes();
            }
            else{
                g.selectAll(".routes")
                    .remove();
            }

        }
    })

    $scope.$watch('stopsChecked', function(nv, ov){
        if(nv !== ov){
            if(nv === true){
                addStops();
            }
            else{
                g.selectAll(".stops")
                    .remove();
            }

        }
    })


    $scope.query = function(){
       if($scope.selectedDataTable === 'Demographics'){
           var dataToSend = {race: $scope.selectedCategory, ageGrp: $scope.selectedAgeGrp};

           $http.post('/query-demographics', dataToSend)
               .success(function(response){
                   setMap(response);
               })

       }
        else{
           var dataToSend = {race: $scope.selectedCategory, ageGrp: $scope.selectedAgeGrp};

           $http.post('/query-income', dataToSend)
               .success(function(response){
                   setMap(response); //call d3 function that will color map
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


    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    function loadShapes(error, blockGrp){

        var shape = topojson.feature(blockGrp, blockGrp.objects.bg10);

        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var feature = g.selectAll("path")
            .data(shape.features)
            .enter()
            .append("path")
            .attr("class", "q0-7 zones");

        var title= feature.append("svg:title")
            .attr("class", "pathTitle");


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

            try{
                g.selectAll("circle").attr("cx", function(d){
                    var x = d.lon;
                    var y = d.lat;
                    var coord = map.latLngToLayerPoint(new L.LatLng(y,x));
                    return coord.x;
                }).attr("cy", function(d){
                    var x = d.lon;
                    var y = d.lat;
                    var coord = map.latLngToLayerPoint(new L.LatLng(y,x));
                    return coord.y;
                })
                g.selectAll(".routes")
                    .attr("d", path);
                g.selectAll(".stops")
                    .attr("d", path);


            }
            catch(e)
            {
                console.log(e);
            }


        }

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

    }

    function setMap(data){
        var pctArr = [];
        data.forEach(function(cv, index, arr){
           mapById.set(cv.GEOid2, {
               "county":cv.county,
               "grp_tot":cv.grp_tot,
               "tot_dem":cv.tot_dem,
               "tot_inc":cv.tot_inc,
               "pct":cv.pct
           });
           pctArr.push(cv.pct)
        });
        var max = Math.max.apply(null, pctArr);
        console.log(max);
        quantize.domain([0,max]);

        d3.json('data/block-group.json', function(error, blkGrp){
            var shape = topojson.feature(blkGrp, blkGrp.objects.bg10);
            var feature = g.selectAll("path")
                //.attr("class", "")

            feature
                .data(shape.features)
                .attr("class", function(d){
                    try{
                        return quantize(mapById.get(d.properties.GEOID10).pct) + " zones";
                    }
                    catch(e){
                        return "empty";
                    }
                });

            d3.selectAll(".pathTitle")
                .data(shape.features)
                .text(function(d){
                    try{
                        return "Total Pop: " + mapById.get(d.properties.GEOID10).tot_dem + "\n" +
                                "Total HH: "  + mapById.get(d.properties.GEOID10).tot_inc + "\n" +
                                "Query Pop: " + mapById.get(d.properties.GEOID10).grp_tot + "\n" +
                                "Pct: " + percent(mapById.get(d.properties.GEOID10).pct) + "\n" +
                                "County: " + mapById.get(d.properties.GEOID10).county;
                    }
                    catch(e){
                        return "N/A";
                    }

                });
        });
    }
    function addChurches(){
        d3.csv('data/churches.csv', function(error, churches){
            var churches = g.selectAll("circle")
                .data(churches)
                .enter()
                .append("circle")
                .attr("r", 3)
                .attr("cx", function(d){
                    var x = d.lon;
                    var y = d.lat;
                    var coord = map.latLngToLayerPoint(new L.LatLng(y,x));
                    return coord.x;
                })
                .attr("cy", function(d){
                    var x = d.lon;
                    var y = d.lat;
                    var coord = map.latLngToLayerPoint(new L.LatLng(y,x));
                    return coord.y;
                })

            churches.append("svg:title")
                .text(function(d){return d.name;});

        });
    }

    function addRoutes(){
        d3.json('data/routes.json', function(error, routes){

            var shape = topojson.feature(routes, routes.objects.routes2);
            var transform = d3.geo.transform({point: projectPoint}),
                path = d3.geo.path().projection(transform);

            var routes = g.selectAll(".routes")
                .data(shape.features)
                .enter()
                .append("path")
                .attr("class", "routes")
                .attr("d", path);



            function projectPoint(x, y) {
                var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            }

        });


    }

    function addStops(){
        d3.json('data/stops.json', function(error, stops){

            var shape = topojson.feature(stops, stops.objects.stops2);
            var transform = d3.geo.transform({point: projectPoint}),
                path = d3.geo.path().projection(transform);

            var stops = g.selectAll(".stops")
                .data(shape.features)
                .enter()
                .append("path")
                .attr("class", "stops")
                .attr("d", path);



            function projectPoint(x, y) {
                var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            }

        });


    }


//variables for map classification
    var quantize = d3.scale.quantize()
        .range(d3.range(7).map(function(i){return "q" + i + "-7";}));

    //initial map load
    queue().defer(d3.json, 'data/block-group.json').await(loadShapes);

});