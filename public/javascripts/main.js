/**
 * Created by JMartinez on 5/20/2015.
 */
var app = angular.module("app", ["ngRoute", "ngAnimate"]);
app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/title-page',{
        templateUrl: 'views/title-page.html',
        controller: 'title-page-ctrl'
    }).when('/aging-forecast', {
        templateUrl: 'views/aging-forecast.html',
        controller: 'aging-forecast-ctrl'
    }).when('/organizational-roles', {
        templateUrl: 'views/organizational-roles.html',
        controller: 'organizational-roles-ctrl'
    }).when('/acs', {
        templateUrl: 'views/acs.html',
        controller: 'acs-ctrl'
    }).when('/region-demographics', {
        templateUrl: 'views/region-demographics.html',
        controller: 'demo-ctrl'
    });

}])