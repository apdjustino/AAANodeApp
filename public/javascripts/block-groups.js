/**
 * Created by JMartinez on 5/21/2015.
 */
app.controller('block-groups-ctrl', function($scope, $http){

    var map = new L.map("mapCanvas", {center:[39.75, -104.95], zoom:10})
        .addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));

    map.setView([39.75, -104.95], 10);

});