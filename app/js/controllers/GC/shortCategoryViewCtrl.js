four51.app.controller('ShortCategoryViewCtrl', ['$routeParams', '$rootScope', '$scope', 'Category', 'Product',
function ($routeParams, $rootScope, $scope, Category, Product) {
    $scope.switchCollapse = function(c){
        $scope.collapser = c;
    };
    $rootScope.$on('event:MerchantCategorySelected', function(event,category) {
        Category.get(category.InteropID, function(cat) {
            $scope.currentCategory = cat;
            $scope.tabs = [
                {title: 'Description', content:cat.SpaDescription.description}    ,
                {title: 'More Info', content:cat.SpaDescription.infoTab}    ,
                {title: 'Canadian Info', content:cat.SpaDescription.canadianTab}
            ];
            $scope.collapser = 'Order';

        });
        Product.search(category.InteropID, null, null, function(products) {
            var sortable = [];
            for (var i = 0; i < products.length; i++) {
                sortable.push([products[i], products[i].StandardPriceSchedule.PriceBreaks[0].Price])
            }
            sortable.sort(function(a,b) { return a[1] - b[1] });

            var sortedProducts = [];
            for (var j = 0; j < sortable.length; j++) {
                sortedProducts.push(sortable[j][0])
            }

            for (var p = 0; p < sortedProducts.length; p++) {
                sortedProducts[p].Denomination = sortedProducts[p].Name.split('$')[1].replace(/[A-Za-z$-]/g, "").trim();
            }

            $scope.products = sortedProducts;
            $scope.selectedProduct = $scope.products[0];
            $rootScope.$broadcast('event:MerchantProductSelected', $scope.products[0]);
        });
    });
    $scope.setSearchProduct = function(product) {
        //$scope.selectedProductMerchant = product.merchantName;
        $scope.selectedProduct = product;
        $rootScope.$broadcast('event:MerchantProductSelected', product);
    }
}]);