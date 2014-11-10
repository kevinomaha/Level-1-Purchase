four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http',
function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http) {

    $scope.selectedEmployee = Customization.getEmployee();
    console.log($scope.selectedEmployee); //fill in inputs with employee details

    $http.get('http://GCA-SVCS01-DEV.cloudapp.net/DigitalTemplate/GetTemplateThumbnails/SCD002-GC1-02/1').
        success(function(data){
            $scope.getTemplate = data;
        });
}]);