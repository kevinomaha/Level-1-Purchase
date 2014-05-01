
four51.app.controller('OrderBillingCtrl', function ($scope, $location, $451, SpendingAccount, Address) {
	SpendingAccount.query(function(data) {
		$scope.SpendingAccounts = data;
		budgetAccountCalculation($scope.tempOrder.BudgetAccountID);

		if ($scope.SpendingAccounts[0].Balance <= 0 || $scope.SpendingAccounts.length == 0) {
			$scope.tempOrder.PaymentMethod = 'CreditCard';
			$scope.isSplitBilling = false;
			store.set("451Cache.TempOrder",{});
			store.set("451Cache.TempOrder",$scope.tempOrder);
		}
		else {
			$scope.tempOrder.PaymentMethod = 'BudgetAccount';
			$scope.tempOrder.BudgetAccountID = $scope.SpendingAccounts[0].ID;
			$scope.currentBudgetAccount = $scope.SpendingAccounts[0];

			if ($scope.SpendingAccounts[0].Balance < $scope.tempOrder.Total) {
				$scope.tempOrder.PaymentMethod = 'CreditCard';
				$scope.remainingOrderTotal = ($scope.tempOrder.Total - $scope.SpendingAccounts[0].Balance).toFixed(2);
				$scope.isSplitBilling = true;
			}
			else {
				$scope.remainingOrderTotal = 0;
				$scope.isSplitBilling = false;
			}

			store.set("451Cache.TempOrder",{});
			store.set("451Cache.TempOrder",$scope.tempOrder);
		}
	});

	$scope.$watch('tempOrder.BillAddressID', function(newValue) {
		if (newValue) {
			Address.get(newValue, function(add) {
				if ($scope.user.Permissions.contains('EditBillToName') && !add.IsCustEditable) {
					$scope.tempOrder.BillFirstName = add.FirstName;
					$scope.tempOrder.BillLastName = add.LastName;
				}
				$scope.BillAddress = add;
			});
		}
	});

	$scope.$watch('tempOrder.PaymentMethod', function(event) {
		if (event == 'BudgetAccount' && $scope.SpendingAccounts) {
			if ($scope.SpendingAccounts.length == 1)
				$scope.tempOrder.BudgetAccountID = $scope.SpendingAccounts[0].ID;
			else {
				var count = 0, account;
				angular.forEach($scope.SpendingAccounts, function(s) {
					if (s.AccountType.PurchaseCredit) {
						count += 1;
						account = s;
					}
				});
				if (count == 1 && account)
					$scope.tempOrder.BudgetAccountID = account.ID;
			}
		}
		else {
			if (!$scope.isSplitBilling && $scope.currentOrder) {
				//$scope.tempOrder.BudgetAccountID = null;
				//$scope.tempOrder.currentBudgetAccount = null;
			}
		}
		$scope.cart_billing.$setValidity('paymentMethod', validatePaymentMethod(event));
	});

	var budgetAccountCalculation = function(value) {
		if (value) {
			var valid = validatePaymentMethod('BudgetAccount');
			angular.forEach($scope.SpendingAccounts, function(a) {
				if (a.ID == value) {
					$scope.currentBudgetAccount = a;
				}
			});
			var discount = $scope.currentBudgetAccount.AccountType.MaxPercentageOfOrderTotal != 100 ?
				$scope.tempOrder.Total * ($scope.currentBudgetAccount.AccountType.MaxPercentageOfOrderTotal *.01) :
				$scope.currentBudgetAccount.Balance;
			$scope.remainingOrderTotal = $scope.tempOrder.Total - discount;
			$scope.cart_billing.$setValidity('paymentMethod', valid);
		}
	}

	$scope.$watch('tempOrder.Total', function(total) {
		if ($scope.currentOrder && $scope.tempOrder.BudgetAccountID)
			budgetAccountCalculation($scope.tempOrder.BudgetAccountID);
	});

	$scope.$watch('tempOrder.BudgetAccountID', function(value) {
		$scope.currentBudgetAccount = null;
		budgetAccountCalculation(value);
	});

	function validatePaymentMethod(method) {
		var validateAccount = function() {
			var account = null;
			angular.forEach($scope.SpendingAccounts, function(a) {
				if ($scope.tempOrder && a.ID == $scope.tempOrder.BudgetAccountID)
					account = a;
			});
			if (account) {
				$scope.isSplitBilling = false;
				if (account.AccountType.MaxPercentageOfOrderTotal != 100) {
					$scope.isSplitBilling = true;
					return false;
				}

				if (account.Balance < $scope.tempOrder.Total) {
					$scope.isSplitBilling = !account.AccountType.AllowExceed;
					return account.AccountType.AllowExceed;
				}
				else
					return true;
			}
			return false;
		}

		var valid = false;
		switch (method) {
			case 'Undetermined':
				valid = $scope.user.Permissions.contains('SubmitForApproval');
				break;
			case 'PurchaseOrder':
				valid = $scope.user.Permissions.contains('PayByPO');
				break;
			case 'BudgetAccount':
				valid = $scope.user.Permissions.contains('PayByBudgetAccount');
				valid = valid ? validateAccount() : valid;
				break;
			case 'CreditCard':
				valid = $scope.user.Permissions.contains('PayByCreditCard');
				break;
			default:
				return false;
		}
		return valid;
	}

	function validateCVN(event) {
		var cvnVal = event[0];
		var cardType = event[1];

		if (cvnVal && cardType) {
			var returnVal = false;
			$scope.cvnInvalid = true;

			switch(cardType) {
				case "Visa":
					returnVal = cvnVal.length == 3 ? true : false;
					break;
				case "MasterCard":
					returnVal = cvnVal.length == 3 ? true : false;
					break;
				case "Discover":
					returnVal = cvnVal.length == 3 ? true : false;
					break;
				case "AmericanExpress":
					returnVal = cvnVal.length == 4 ? true : false;
					break;
			}

			$scope.cvnInvalid = !returnVal;

			return returnVal;
		}
		else {
			if ($scope.tempOrder.PaymentMethod == "BudgetAccount") {
				return true;
			}
			else {
				return false;
			}
		}
	}

	$scope.$watch('[tempOrder.CreditCard.CVN,tempOrder.CreditCard.Type]', function(event) {
		$scope.cart_billing.$setValidity('cvn', validateCVN(event));
	}, true);

	function validateExpDate(event) {
		if (event) {
			$scope.expDateInvalid = true;
			var expMonth = +(event.substring(0,2)) - 1;
			var expYear = +("20" + event.substring(2,4));

			var date = new Date();

			var month = date.getMonth();
			var year = date.getFullYear();

			var expDate = new Date(expYear,expMonth);
			var thisDate = new Date(year,month);

			var returnVal = (thisDate <= expDate && expMonth < 13);
			$scope.expDateInvalid = !returnVal;

			return returnVal;
		}
		else {
			return false;
		}
	}

	$scope.$watch('tempOrder.CreditCard.ExpirationDate', function(event) {
		$scope.cart_billing.$setValidity('expDate', validateExpDate(event));
	});
});
