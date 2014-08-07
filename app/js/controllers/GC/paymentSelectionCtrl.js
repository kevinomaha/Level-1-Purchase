four51.app.controller('PaymentSelectionController', ['$scope', '$rootScope',
function ($scope, $rootScope) {
	$scope.setPaymentMethod = function(type) {
		$scope.tempOrder.PaymentMethod = type;
        $scope.cacheOrder($scope.tempOrder);
		$rootScope.$broadcast('event:paymentMethodChange', type);
	};

	$scope.setBudgetAccount = function(count) {
		$scope.setPaymentMethod('BudgetAccount');
		//if ($scope.tempOrder.BudgetAccountID || count > 1) return;
		angular.forEach($scope.SpendingAccounts, function(a) {
			if (a.AccountType.PurchaseCredit) {
				$scope.tempOrder.BudgetAccountID = a.ID;
				$scope.selectedBudgetAccount = a;
			}
		});
        angular.forEach($scope.addresses, function(a) {
            if (a.AddressName == "Main Billing Address") {
                $scope.tempOrder.BillAddressID = a.ID;
            }
        });
	};

    $scope.$watch('tempOrder.BudgetAccountID', function() {
        if ($scope.tempOrder.BudgetAccountID) {
            $scope.setBudgetAccount();
        }
    });

	$rootScope.$on('event:SpendingAccountUpdate', function(event, accounts) {
		if ($scope.tempOrder.PaymentMethod == 'BudgetAccount') {
			angular.forEach(accounts, function(a) {
				if ($scope.selectedBudgetAccount) return;
				if ($scope.tempOrder.BudgetAccountID == null && a.AccountType.PurchaseCredit) {
					$scope.tempOrder.BudgetAccountID = a.ID;
					$scope.selectedBudgetAccount = a;
				}
				else if (a.AccountType.PurchaseCredit && a.ID == $scope.tempOrder.BudgetAccountID) {
					$scope.selectedBudgetAccount = a;
				}
			});
		}
	});
}]);

