four51.app.controller('PaymentSelectionController', function ($scope, $rootScope) {;
	$scope.setPaymentMethod = function(type) {
		$scope.tempOrder.PaymentMethod = type;
		store.set("451Cache.TempOrder",{});
		store.set("451Cache.TempOrder",$scope.tempOrder);
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
});

