four51.app.controller('NavCtrl', ['$location', '$route', '$scope', '$451', 'User','SpendingAccount',
function ($location, $route, $scope, $451, User, SpendingAccount) {
    $scope.Logout = function(){
        User.logout();
        if ($scope.isAnon) {
            $location.path("/catalog");
            User.login();
        }
    };

	$scope.refreshUser = function() {
		store.clear();
	};

    SpendingAccount.query(function(data) {
        $scope.SpendingAccounts = data;
    });

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
	}

	$scope.$on('event:orderUpdate', function(event, order) {
		$scope.cartCount = order ? (order.Status == 'Unsubmitted' || order.Status == 'AwaitingApproval') ? order.LineItems.length : null : null;

        if (!order || order.Status == "Open") {
            SpendingAccount.query(function(data) {
                $scope.SpendingAccounts = data;
            });
        }
	});

    $scope.$on('event:tempOrderUpdated', function(event, order) {
        $scope.tempOrderCount = order.LineItems ? order.LineItems.length : null;
    });

    $scope.$watch('tempOrder.LineItems', function(newval) {
        $scope.tempOrderCount = ($scope.tempOrder && $scope.tempOrder.LineItems) ? $scope.tempOrder.LineItems.length : null;
    }, true);
}]);