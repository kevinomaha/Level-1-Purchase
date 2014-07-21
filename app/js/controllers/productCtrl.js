four51.app.controller('ProductCtrl', ['$scope', '$routeParams', '$route', '$location', '$451', 'Product', 'ProductDisplayService', 'AddressList', 'Order', 'Variant', 'User',
function ($scope, $routeParams, $route, $location, $451, Product, ProductDisplayService, AddressList, Order, Variant, User) {
    $scope.selected = 1;
    $scope.LineItem = {};
	$scope.addToOrderText = "Add To Cart";
	$scope.loadingIndicator = true;
    $scope.digitalShipAddressID = "";

    AddressList.query(function(list) {
        for (var a = 0; a < list.length; a++) {
            if (list[a].AddressName == 'Email Delivery') {
                $scope.digitalShipAddressID = list[a].ID;
            }
        }
    });

    $scope.shippers = store.get("451Cache.GCShippers");

    var shipper = {};
    angular.forEach($scope.shippers, function(s) {
        if (s.Name.indexOf('Email Delivery') > -1) {
            shipper = s;
        }
    });

	$scope.calcVariantLineItems = function(i){
		$scope.variantLineItemsOrderTotal = 0;
		angular.forEach($scope.variantLineItems, function(item){
			$scope.variantLineItemsOrderTotal += item.LineTotal || 0;
		})
	};
	function setDefaultQty(lineitem) {
		$scope.LineItem.Quantity = (lineitem.Product.StandardPriceSchedule && lineitem.Product.StandardPriceSchedule.DefaultQuantity > 0) ? lineitem.Product.StandardPriceSchedule.DefaultQuantity : null;
	}
	function init() {
		ProductDisplayService.getProductAndVariant($routeParams.productInteropID, $routeParams.variantInteropID, function (data) {
			$scope.LineItem.Product = data.product;
			$scope.LineItem.Variant = data.variant;
			setDefaultQty($scope.LineItem);
			ProductDisplayService.setNewLineItemScope($scope);
			ProductDisplayService.setProductViewScope($scope);
			$scope.$broadcast('ProductGetComplete');
			$scope.loadingIndicator = false;
			$scope.setAddToOrderErrors();
		});
	}
	init();

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

    $scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems:[]};

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

    $scope.addToOrder = function(){
        if(!$scope.tempOrder){
            $scope.tempOrder = {};
            $scope.tempOrder.LineItems = [];
        }
        if(!$scope.tempOrder.LineItems){
            $scope.tempOrder.LineItems = [];
        }

        $scope.LineItem.MerchantCardUniqueID = randomString();
        if ($scope.LineItem.Product.Specs['Physical/Digital'] && $scope.LineItem.Product.Specs['Physical/Digital'].Value == 'Digital') {
            $scope.LineItem.Specs = $scope.LineItem.Product.Specs;
            $scope.LineItem.ShipAddressID = $scope.digitalShipAddressID;
            $scope.LineItem.Shipper = shipper;
            $scope.LineItem.ShipperName = shipper.Name;
            $scope.LineItem.ShipperID = shipper.ID;
            $scope.LineItem.IsDigital = true;
        }
        else {
            $scope.LineItem.IsDigital = false;
        }

        $scope.tempOrder.LineItems.push($scope.LineItem);

        store.set("451Cache.TempOrder",{});
        store.set("451Cache.TempOrder",$scope.tempOrder);

        $scope.$broadcast('event:tempOrderUpdated',$scope.tempOrder);

        $location.path('/cart');
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
                angular.forEach($scope.LineItem.Product.Specs, function(s) {
                    s.InputType =  s.Name.toLowerCase().indexOf('email') > -1 ? "email" : "text";
                });
                $scope.$broadcast('ProductGetComplete');
                if ($scope.LineItem.Product.Specs['Email1']){
                    $scope.digitalProduct = true;
                    $scope.LineItem.Product.Specs = (tempSpecs && tempSpecs.Email1 && data.product.Specs.Email1) ? tempSpecs : $scope.LineItem.Product.Specs;
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

    $scope.increaseDenom = function(product) {
        $scope.minDenom = false;
        $scope.maxDenom = false;
        for (var i = 0; i < $scope.products.length; i++) {
            if ($scope.products[i].Denomination == product.Denomination && $scope.products[i + 1]) {
                $scope.selectedProduct = $scope.products[i + 1];
                if ((i+1) == ($scope.products.length - 1)) {
                    $scope.maxDenom = true;
                }
                $scope.$broadcast('event:MerchantProductSelected', $scope.selectedProduct);
            }
        }
    };

    $scope.decreaseDenom = function(product) {
        $scope.minDenom = false;
        $scope.maxDenom = false;
        for (var i = 0; i < $scope.products.length; i++) {
            if (($scope.products[i].Denomination == product.Denomination) && $scope.products[i - 1]) {
                $scope.selectedProduct = $scope.products[i - 1];
                if (i == 1) {
                    $scope.minDenom = true;
                }
                $scope.$broadcast('event:MerchantProductSelected', $scope.selectedProduct);
            }
        }
    };
}]);

