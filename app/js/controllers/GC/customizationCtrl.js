four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http', 'Order', 'Product',
function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http, Order, Product) {

    $scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems: []};
    if (typeof($scope.tempOrder) != 'object') {
        $scope.tempOrder = LZString.decompressFromUTF16($scope.tempOrder);
        $scope.tempOrder = JSON.parse($scope.tempOrder);
    }

    //personalized opening message
    $scope.openingMessage = {};

    $scope.recipientList = Customization.getRecipients();
    $scope.selectedProduct = Customization.getProduct();
    console.log("selected Employee");
    console.log($scope.selectedEmployee);
    console.log("selected product");
    console.log($scope.selectedProduct);
    //Customization.employeeToSpecs($scope.selectedEmployee, $scope.selectedProduct);

    Product.get($scope.selectedProduct.InteropID, function(p) {
        $scope.currentProduct = p;
        console.log("current product");
        console.log($scope.currentProduct);
        console.log("Current logged in user:");
        console.log($scope.user);
    });

    $http.get('https://gca-svcs02-dev.cloudapp.net/ClientService/GetTemplateThumbnails?s=SCD002-GC1-02&o=1').
        success(function(data){
             $scope.getTemplate = data;
             $scope.thumbnail = $scope.getTemplate[0].ThumbnailUrl;
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