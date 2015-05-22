/**
 * Created by JMartinez on 5/20/2015.
 */
app.controller('title-page-ctrl', function($scope){
    $scope.is_loaded = true;

    $scope.$watch('is_loaded', function(nv,ov){
        d3.select('#forward').attr('href','#/organizational-roles')
        d3.select('#slide-title-text').text('A Demographic Overview Of AAA')
    })
});