four51.app.controller('OrderBillingCtrl', ['$scope', '$location', '$451', 'SpendingAccount', 'Address', 'CustomAddressList',
function ($scope, $location, $451, SpendingAccount, Address, CustomAddressList) {
	SpendingAccount.query(function(data) {
		$scope.SpendingAccounts = data;
		budgetAccountCalculation($scope.currentOrder.BudgetAccountID);
        if ($scope.currentOrder.PaymentMethod == 'CreditCard') {
            $scope.currentOrder.BillAddressID = null;
        }
        CustomAddressList.getall(function(list) {
            $scope.loadingAddresses = false;
            angular.forEach(list, function(a) {
                if (a.IsBilling && !a.IsCustEditable && $scope.currentOrder.PaymentMethod && $scope.currentOrder.PaymentMethod == 'BudgetAccount') {
                    $scope.currentOrder.BillAddressID = a.ID;
                    $scope.currentOrder.BillAddress = a;
                }
            });
        });
	});

	$scope.$watch('currentOrder.BillAddressID', function(newValue) {
		if (newValue) {
			Address.get(newValue, function(add) {
				if ($scope.user.Permissions.contains('EditBillToName') && !add.IsCustEditable) {
					$scope.currentOrder.BillFirstName = add.FirstName;
					$scope.currentOrder.BillLastName = add.LastName;
				}
				$scope.BillAddress = (add.IsBilling && add.IsCustEditable) ? add : {};
                $scope.currentOrder.BillAddress = (add.IsBilling && add.IsCustEditable) ? add : {};
			});
		}
	});

	$scope.$watch('currentOrder.PaymentMethod', function(event) {
		if (event == 'BudgetAccount' && $scope.SpendingAccounts) {
			if ($scope.SpendingAccounts.length == 1) {
                $scope.currentOrder.BudgetAccountID = $scope.SpendingAccounts[0].ID;
            }
			else {
				var count = 0, account;
				angular.forEach($scope.SpendingAccounts, function(s) {
					if (s.AccountType.PurchaseCredit) {
						count += 1;
						account = s;
					}
				});
				if (count == 1 && account)
					$scope.currentOrder.BudgetAccountID = account.ID;
			}
            $scope.cart_billing.$setValidity('cvn', true);
            $scope.cart_billing.$setValidity('expDate', true);
		}
		else if($scope.currentOrder.PaymentMethod == 'CreditCard' && !$scope.currentOrder.BillAddressID && $scope.currentOrder.BillAddress && ($scope.currentOrder.BillAddress.IsBilling && $scope.currentOrder.BillAddress.IsCustEditable)) {
            $scope.currentOrder.BillAddress = {};
            $scope.currentOrder.BillAddressID = null;
		}
        else if ($scope.currentOrder.PaymentMethod == 'CreditCard' && $scope.currentOrder.BillAddress && $scope.currentOrder.BillAddress && ($scope.currentOrder.BillAddress.IsBilling && !$scope.currentOrder.BillAddress.IsCustEditable)) {
            $scope.currentOrder.BillAddress = {};
            $scope.currentOrder.BillAddressID = null;
        }
		$scope.cart_billing.$setValidity('paymentMethod', validatePaymentMethod(event));
	});

	var budgetAccountCalculation = function(value) {
		if (value && $scope.SpendingAccounts) {
			var valid = validatePaymentMethod('BudgetAccount');
			angular.forEach($scope.SpendingAccounts, function(a) {
				if (a.ID == value) {
					$scope.currentBudgetAccount = a;
				}
			});
            if ($scope.currentBudgetAccount) {
                var discount = $scope.currentBudgetAccount.AccountType.MaxPercentageOfOrderTotal != 100 ?
                    $scope.currentOrder.Total * ($scope.currentBudgetAccount.AccountType.MaxPercentageOfOrderTotal *.01) :
                    $scope.currentBudgetAccount.Balance;
            }
			$scope.cart_billing.$setValidity('paymentMethod', valid);
		}
	}

	$scope.$watch('currentOrder.Total', function(total) {
		if ($scope.currentOrder && $scope.currentOrder.BudgetAccountID)
			budgetAccountCalculation($scope.currentOrder.BudgetAccountID);
	});

	$scope.$watch('currentOrder.BudgetAccountID', function(value) {
		$scope.currentBudgetAccount = null;
		budgetAccountCalculation(value);
	});

	function validatePaymentMethod(method) {
		var validateAccount = function() {
			var account = null;
			angular.forEach($scope.SpendingAccounts, function(a) {
				if ($scope.tempOrder && a.ID == $scope.currentOrder.BudgetAccountID)
					account = a;
			});
			if (account) {
				$scope.isSplitBilling = false;
				if (account.AccountType.MaxPercentageOfOrderTotal != 100) {
					return false;
				}

				if (account.Balance < $scope.currentOrder.Total) {
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
            return $scope.currentOrder.PaymentMethod == "BudgetAccount";
		}
	}

	$scope.$watch('[currentOrder.CreditCard.CVN,currentOrder.CreditCard.Type]', function(event) {
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
            return true;
		}
        $scope.$apply();
	}

	$scope.$watch('currentOrder.CreditCard.ExpirationDate', function(event) {
		$scope.cart_billing.$setValidity('expDate', validateExpDate(event));
	});

    $scope.editBillAddress = function(address) {
        $scope.billaddressform = true;
        $scope.billaddress = address;
    };
}]);

