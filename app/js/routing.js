four51.app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider.
        when('/employeesearch', { templateUrl: 'partials/GC/employeeSearch.html', controller: 'EmployeeSearchCtrl' }).
        when('/supercertificate', { templateUrl: 'partials/GC/customization.html', controller: 'CustomizationCtrl' }).
        when('/customizationStep1', { templateUrl: 'partials/GC/customizationStep1.html', controller: 'CustomizationCtrl' }).
        when('/customizationStep2', { templateUrl: 'partials/GC/customizationStep2.html', controller: 'CustomizationCtrl' }).
        when('/customizationStep3', { templateUrl: 'partials/GC/customizationStep3.html', controller: 'CustomizationCtrl' }).
        when('/visa', { templateUrl: 'partials/GC/visa.html', controller: 'CustomizationCtrl' }).
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