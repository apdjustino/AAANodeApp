/**
 * Created by JMartinez on 5/20/2015.
 */
app.controller('organizational-roles-ctrl', function($scope){
    $scope.is_loaded = true;

    $scope.$watch('is_loaded', function(nv,ov){
        d3.select('#forward').attr('href','#/aging-forecast')
        d3.select('#backward').attr('href','#/title-page')
        d3.select('#slide-title-text').text('Organizational Roles')

    })

    d3.select('h2')
        .on('click', function(d){
            d3.select('#org-title')
                .transition()
                .style("opacity","0");

            d3.select('.org-list')
                .transition()
                .style("opacity","0");

            d3.select('#org-title-rpo')
                .transition()
                .style("opacity","1")

            d3.select('.rpo')
                .transition()
                .style("opacity","1")

        })

});