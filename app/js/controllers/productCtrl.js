four51.app.controller('ProductCtrl', ['$scope', '$routeParams', '$route', '$location', '$451', 'Product', 'ProductDisplayService', 'AddressList', 'Order', 'Variant', 'User', 'Customization',
function ($scope, $routeParams, $route, $location, $451, Product, ProductDisplayService, AddressList, Order, Variant, User, Customization) {
    $scope.selected = 1;
    $scope.LineItem = {};
	$scope.addToOrderText = "Add To Cart";
	$scope.loadingIndicator = true;
    $scope.digitalShipAddressID = "";

    $scope.recipientList = Customization.getRecipients();

    AddressList.query(function(list) {
        for (var a = 0; a < list.length; a++) {
            if (list[a].IsShipping && !list[a].IsCustEditable) {
                $scope.digitalShipAddressID = list[a].ID;
            }
        }
    });

	$scope.calcVariantLineItems = function(i){
		$scope.variantLineItemsOrderTotal = 0;
		angular.forEach($scope.variantLineItems, function(item){
			$scope.variantLineItemsOrderTotal += item.LineTotal || 0;
		})
	};

	$scope.deleteVariant = function(v, redirect) {
		if (!v.IsMpowerVariant) return;
		// doing this because at times the variant is a large amount of data and not necessary to send all that.
		var d = {
			"ProductInteropID": $scope.LineItem.Product.InteropID,
			"InteropID": v.InteropID
		};
		Variant.delete(d,
			function() {
				redirect ? $location.path('/product/' + $scope.LineItem.Product.InteropID) : init();
			},
			function(ex) {
				$scope.lineItemErrors.push(ex.Message);
				$scope.showAddToCartErrors = true;
				console.log($scope.lineItemErrors);
			}
		);
	};

    var randomString = function() {
        var chars = "0123456789abcdefghijklmnop";
        var string_length = 7;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    };

    $scope.addToOrder = function(lineitem) {
        var product = angular.copy(lineitem.Product);
        if (!product.Quantity) {
            product.Quantity = lineitem.Quantity;
        }
        Customization.addToCartStatic(product, $scope.$parent.$parent.selectedRecipients, $scope.$parent.$parent.currentOrder, function(order) {
            $scope.currentOrder = order;
            Order.save($scope.currentOrder, function(data) {
                $scope.user.CurrentOrderID = data.ID;
                User.save($scope.user, function() {
                    Customization.clearRecipients();
                    $location.path('cart');
                });
            });
        });
    };

    $scope.$on('event:MerchantProductSelected', function(event,product) {
        if (product) {
            if ($scope.LineItem && $scope.LineItem.Product && $scope.LineItem.Product.Specs) {
                var tempSpecs = $scope.LineItem.Product.Specs;
            }
            ProductDisplayService.getProductAndVariant(product.InteropID,null, function(data){
                $scope.LineItem.Product = data.product;
                $scope.LineItem.Variant = data.variant;
                ProductDisplayService.setNewLineItemScope($scope);
                ProductDisplayService.setProductViewScope($scope);
                $scope.$broadcast('ProductGetComplete');
                if ($scope.LineItem.Product.Specs.Email || $scope.LineItem.Product.Specs.Email1){
                    $scope.digitalProduct = true;
                    $scope.LineItem.Product.Specs = (tempSpecs && tempSpecs.Email1 && data.product.Specs.Email1) ? tempSpecs : $scope.LineItem.Product.Specs;
                    //if ($scope.LineItem.Product.Specs.Email) $scope.LineItem.Product.Specs.Email.Value = $scope.selectedEmployee.Username;
                    //if ($scope.LineItem.Product.Specs.Email1) $scope.LineItem.Product.Specs.Email1.Value = $scope.selectedEmployee.Username;
                    if ($scope.recipientList && $scope.recipientList.List && $scope.recipientList.List.length == 1) {
                        if ($scope.LineItem.Product.Specs.Email) $scope.LineItem.Product.Specs.Email.Value = $scope.recipientList.List[0].EmailAddress;
                        if ($scope.LineItem.Product.Specs.Email1) $scope.LineItem.Product.Specs.Email1.Value = $scope.recipientList.List[0].EmailAddress;
                    }
                }
            });
            $scope.selectedProduct =  product;
        }
    });

    $scope.backToMerchantList = function(){
        $rootScope.$broadcast('event:BackToMerchantList')
    };

    $scope.minDenom = true;
    $scope.maxDenom = false;

    $scope.setDenomination = function(product){
        $scope.selectedProduct = product;
        $scope.$broadcast('event:MerchantProductSelected', $scope.selectedProduct);
    };
}]);

