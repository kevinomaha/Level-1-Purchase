four51.app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider.
		when('/order', { templateUrl: 'partials/orderSearchView.html', controller: 'OrderSearchCtrl' }).
		when('/order/:id', { templateUrl: 'partials/Reporting/orderHistoryView.html', controller: 'OrderViewCtrl' }).
        when('/cart', { templateUrl: 'partials/GC/cartView.html', controller: 'CartViewCtrl'}).
        when('/main', { templateUrl: 'partials/GC/main.html', controller: 'MainGCPurchaseCtrl' }).
        when('/main/edit/:lineItemID', { templateUrl: 'partials/GC/main.html', controller: 'MainGCPurchaseCtrl' }).
        when('/merchant', { templateUrl: 'partials/GC/merchantView.html', controller: 'MerchantViewCtrl' }).
        when('/myaccount', { templateUrl: 'partials/GC/myAccount.html', controller: 'MyAccountCtrl' }).
        when('/faq', { templateUrl: 'partials/GC/faq.html', controller: 'StaticPageCtrl' }).
        when('/contact', { templateUrl: 'partials/GC/contact.html', controller: 'StaticPageCtrl' }).
        when('/catalog/:categoryInteropID', { templateUrl: 'partials/GC/merchantView.html', controller: 'MerchantViewCtrl' }).
        when('/addresses', { templateUrl: 'partials/addressListView.html', controller: 'AddressListCtrl' }).
        when('/order', { templateUrl: 'partials/orderSearchView.html', controller: 'OrderSearchCtrl' }).
		otherwise({redirectTo: '/main'});
}]);