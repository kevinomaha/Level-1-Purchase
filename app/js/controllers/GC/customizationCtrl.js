four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http', 'Order', 'Product',
function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http, Order, Product) {

    $scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems: []};
    if (typeof($scope.tempOrder) != 'object') {
        $scope.tempOrder = LZString.decompressFromUTF16($scope.tempOrder);
        $scope.tempOrder = JSON.parse($scope.tempOrder);
    }

    $scope.selectedEmployee = Customization.getEmployee();
    $scope.selectedProduct = Customization.getProduct();
    console.log($scope.selectedEmployee); //fill in inputs with employee details
    console.log($scope.selectedProduct);

    Product.get($scope.selectedProduct.InteropID, function(p) {
        $scope.currentProduct = p;
        console.log($scope.currentProduct);
    });

    $http.get('https://gca-svcs01-dev.cloudapp.net/ClientService/GetTemplateThumbnails?s=SCD002-GC1-02&o=1').
        success(function(data){
            //console.log(data);
            $scope.getTemplate = data;
            //console.log($scope.getTemplate);
            $scope.thumbnail = $scope.getTemplate[0].ThumbnailUrl;
            console.log($scope.thumbnail);
            console.log($scope.selectedEmployee.FirstName);
            //console.log($scope.selectedEmployee.LastName);
            //console.log($scope.selectedEmployee.UserID);
            //console.log($scope.selectedEmployee.Username);
            //console.log($scope.selectedEmployee);
            //console.log($scope.selectedProduct);
        }).
        error(function(data, status, headers, config ) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });

    $scope.addToCart = function(product) {
        Customization.addToCart(product, $scope.tempOrder);
        $scope.cacheOrder($scope.tempOrder);
        $location.path('cart');
    };
}]);