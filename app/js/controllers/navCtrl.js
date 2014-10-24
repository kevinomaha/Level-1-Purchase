four51.app.controller('NavCtrl', ['$location', '$route', '$scope', '$451', '$rootScope', 'User','SpendingAccount', '$window',
function ($location, $route, $scope, $451, $rootScope, User, SpendingAccount, $window) {
    $scope.Logout = function(){
        User.logout();
        if ($window.location.href.indexOf('teststore') > -1 || $window.location.href.indexOf('qastore') > -1) {
            $window.location.href =  "http://spa-test.gcincentives.com/"
        }
        else {
            $window.location.href = "http://login.gcincentives.com/";
        }
        $scope.gettingShippers = false;
        if ($scope.isAnon) {
            $location.path("/main");
            User.login();
        }
    };

	$scope.refreshUser = function() {
		store.clear();
	};

    // http://stackoverflow.com/questions/12592472/how-to-highlight-a-current-menu-item-in-angularjs
    $scope.isActive = function(path) {
        var cur_path = $location.path().replace('/', '');
        var result = false;

        if (path instanceof Array) {
            angular.forEach(path, function(p) {
                if (p == cur_path && !result)
                    result = true;
            });
        }
        else {
            if (cur_path == path)
                result = true;
        }
        return result;
    };
    // extension of above isActive in path
    $scope.isInPath = function(path) {
        var cur_path = $location.path().replace('/', '');
        var result = false;

        if(cur_path.indexOf(path) > -1) {
            result = true;
        }
        else {
            result = false;
        }
        return result;
    };

	$scope.Clear = function() {
		localStorage.clear();
	};

	$scope.$on('event:orderUpdate', function(event, order) {
		$scope.cartCount = order ? (order.Status == 'Unsubmitted' || order.Status == 'AwaitingApproval') ? order.LineItems.length : null : null;

        if (!order || order.Status == "Open") {
            SpendingAccount.query(function(data) {
                $scope.SpendingAccounts = data;
            });
        }
	});

    $scope.$on('event:tempOrderUpdated', function(event, order) {
        if (typeof(order) != 'object') {
            order = LZString.decompressFromUTF16(order);
            order = (order && typeof(order) == 'string') ? JSON.parse(order) : {};
        }
        $scope.tempOrderCount = 0;
        if (order && order.LineItems) {
            angular.forEach(order.LineItems, function(li) {
                $scope.tempOrderCount += +(li.Quantity);
            });
        }
    });

    $scope.$watch('tempOrder.LineItems', function(newval) {
        var order = angular.copy($scope.tempOrder);
        if (order && typeof(order) != 'object') {
            order = LZString.decompressFromUTF16(order);
            order = JSON.parse(order);
        }
        $scope.tempOrderCount = 0;
        if (order && order.LineItems) {
            angular.forEach(order.LineItems, function(li) {
                $scope.tempOrderCount += +(li.Quantity);
            });
        }
    }, true);

    $scope.newOrder = function(orderID) {
        $scope.showOrderNotification = false;
        $location.path('order/' + orderID);
    };

    $scope.showOrderStarted = false;
    $rootScope.$on('orderSubmitStarted', function() {
        $scope.showOrderStarted = true;
    });

    $rootScope.$on('orderSubmitFailed', function() {
        $scope.showOrderStarted = false;
    });

    $scope.showOrderNotification = false;
    $rootScope.$on('orderSubmitComplete', function(event, data) {
        $scope.showOrderStarted = false;
        $scope.showOrderNotification = true;
        $scope.orderNotificationID = data.ID;
    });
}]);