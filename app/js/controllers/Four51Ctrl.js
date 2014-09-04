four51.app.controller('Four51Ctrl', ['$scope', '$route','$routeParams', '$location', '$451', 'User', 'Order', 'Security', 'OrderConfig', 'Category', 'SpendingAccount', 'Product', 'Shipper', 'AddressList', 'AppConst', 'LogoOptions',
function ($scope, $route, $routParams, $location, $451, User, Order, Security, OrderConfig, Category, SpendingAccount, Product, Shipper, AddressList, AppConst, LogoOptions) {
    $scope.AppConst = AppConst;
	$scope.scroll = 0;
	$scope.isAnon = $451.isAnon; //need to know this before we have access to the user object
	$scope.Four51User = Security;
	if ($451.isAnon && !Security.isAuthenticated()){
		User.login(function() {
			$route.reload();
		});
	}

    // fix Bootstrap fixed-top and fixed-bottom from jumping around on mobile input when virtual keyboard appears
    if ( $(window).width() < 960 ) {
        $(document)
        .on('focus', ':input:not("button")', function(e) {
            $('.navbar-fixed-bottom, .headroom.navbar-fixed-top').css("position", "relative");
        })
        .on('blur', ':input', function(e) {
            $('.navbar-fixed-bottom, .headroom.navbar-fixed-top').css("position", "fixed");
        });
    }

    $scope.cacheOrder = function(order) {
        store.set("451Cache.TempOrder",{});
        var o = angular.copy(order);
        store.set("451Cache.TempOrder",LZString.compressToUTF16(JSON.stringify(o)));
    };

    function init() {
        if (Security.isAuthenticated()) {
            User.get(function(user) {
                $scope.user = user;

                user.Company.GoogleAnalyticsCode = "UA-4208136-57";
                analytics(user.Company.GoogleAnalyticsCode);

	            if (!$scope.user.TermsAccepted)
		            $location.path('conditions');

	            /*if (user.CurrentOrderID) {
                    Order.get(user.CurrentOrderID, function(ordr) {
                        $scope.currentOrder = ordr;
			            OrderConfig.costcenter(ordr, user);
                    });
                }
                else {
                    $scope.currentOrder = null;
                }*/
                $scope.currentOrder = null;

                $scope.gcShippers = store.get("451Cache.GCShippers") ? store.get("451Cache.GCShippers") : null;
                /*if (!$scope.gcShippers && !$scope.gettingShippers && window.location.href.indexOf('cart') > -1) {*/
                if (!$scope.gcShippers && !$scope.gettingShippers) {
                    $scope.gettingShippers = true;
                    getShippers();
                }
                else if ($scope.gcShippers) {
                    $scope.$broadcast('event:shippersObtained');
                }

                $scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems:[]};
                if ($scope.tempOrder) {
                    $scope.$broadcast("event:tempOrderUpdated", $scope.tempOrder);
                    getShippers();
                }

            });
            Category.tree(function(data) {
				$scope.tree = data;
				$scope.$broadcast("treeComplete", data);
	        });
        }
    }

	function analytics(id) {
		if (id.length == 0) return;
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', id, 'four51.com');
		ga('require', 'ecommerce', 'ecommerce.js');
	}

	/*trackJs.configure({
		trackAjaxFail: false
	});*/

    $scope.errorSection = '';

    function cleanup() {
        Security.clear();
    }

    $scope.$on('event:auth-loginConfirmed', function(){
        $route.reload();
	    User.get(function(user) {
            user.Company.GoogleAnalyticsCode = "UA-4208136-57";
		    analytics(user.Company.GoogleAnalyticsCode);
	    });
	});
	$scope.$on("$routeChangeSuccess", init);
    $scope.$on('event:auth-loginRequired', cleanup);

    //GC INCENTIVES PURCHASE
    var attempt = 0;
    function getShippers() {
        if (!$scope.tempOrder) return;
        var tempOrder = {};
        if (typeof($scope.tempOrder) != 'object') {
            tempOrder = LZString.decompressFromUTF16($scope.tempOrder);
            tempOrder = JSON.parse(tempOrder);
        }
        else {
            tempOrder = $scope.tempOrder
        }
        if (!store.get("451Cache.GCShippers")) {
            if (tempOrder.LineItems && tempOrder.LineItems.length == 0) return;
            tempOrder.LineItems = [tempOrder.LineItems[0]];
            AddressList.query(function(list) {
                var shipAddress = {};
                var found = false;
                angular.forEach(list, function(a) {
                    if (a.IsShipping && !found) {
                        shipAddress = a;
                        found = true;
                    }
                });
                tempOrder.ShipAddressID = shipAddress.ID;
                tempOrder.LineItems[0].ShipAddressID = shipAddress.ID;
                Order.save(tempOrder,
                    function(o){
                        //save the order fields for use later
                        o.OrderFields.length > 0 ? store.set("451Cache.GCOrderFields", o.OrderFields) : console.log("No Order Fields");

                        Shipper.query(o, function(list) {
                            $scope.shippers = angular.copy(list);
                            if ($scope.shippers.length > 0) {
                                store.set("451Cache.GCShippers", $scope.shippers);
                                $scope.$broadcast('event:shippersObtained');
                            }
                            else {
                                console.log("Shippers empty");
                            }
                            if ($scope.shippers.length > 0) {
                                console.log("Shipper Count:" + $scope.shippers.length);
                                tempOrder = null;
                                Order.delete(o,
                                    function() {
                                        //console.log("Ship Order Deleted");
                                    },
                                    function(ex) {
                                        //console.log("Failed to delete ship order");
                                    }
                                );
                            }
                            else {
                                console.log("Shippers Count: 0");
                                console.log(o);
                                attempt++;
                                if (attempt < 5) {
                                    getShippers();
                                }
                            }
                        });
                    },
                    function(ex) {
                        console.log("Order save failed for shippers");
                        attempt++;
                        if (attempt < 5) {
                            getShippers();
                        }
                    }
                );
            });
        }
    }
}]);