four51.app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider.
		when('/order', { templateUrl: 'partials/orderSearchView.html', controller: 'OrderSearchCtrl' }).
		when('/order/:id', { templateUrl: 'partials/Reporting/orderHistoryView.html', controller: 'OrderViewCtrl' }).
        when('/cart', { templateUrl: 'partials/cartView.html', controller: 'CartViewCtrl'}).
        when('/main', { templateUrl: 'partials/GC/main.html', controller: 'MainGCPurchaseCtrl' }).
        when('/merchant', { templateUrl: 'partials/GC/merchantView.html', controller: 'MerchantViewCtrl' }).
        when('/myaccount', { templateUrl: 'partials/GC/myAccount.html', controller: 'MyAccountCtrl' }).
        when('/catalog/:categoryInteropID', { templateUrl: 'partials/GC/merchantView.html', controller: 'MerchantViewCtrl' }).
		otherwise({redirectTo: '/main'});
}]);