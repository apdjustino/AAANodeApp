/**
 * Created by jmartinez on 5/29/2015.
 */
app.controller('demo-ctrl', function($scope) {
    $scope.is_loaded = true;

    $scope.$watch('is_loaded', function (nv, ov) {
        d3.select('#forward').attr('href', '/block-groups')
        d3.select('#backward').attr('href','#/acs')
        d3.select('#slide-title-text').text('American Community Survey')

    })
});