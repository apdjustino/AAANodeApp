/**
 * Created by JMartinez on 5/20/2015.
 */
app.controller('acs-ctrl', function($scope) {
    $scope.is_loaded = true;

    $scope.$watch('is_loaded', function (nv, ov) {
        d3.select('#forward').attr('href', '#/region-demographics')
        d3.select('#backward').attr('href','#/aging-forecast')
        d3.select('#slide-title-text').text('American Community Survey')

    })
});