four51.app.controller('PaymentSelectionController', ['$scope', '$rootScope', 'SavedCreditCard',
function ($scope, $rootScope, SavedCreditCard) {
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

    SavedCreditCard.query(function(cards) {
        $scope.tempOrder.SavedCards = cards;
    });

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

    var getCardByID = function(id) {
        var selectedCard = null;
        angular.forEach($scope.tempOrder.SavedCards, function(card) {
            if (card.ID == id)
                selectedCard = card;
        });
        return selectedCard;
    };

    $scope.deleteSavedCard = function(id) {
        if (confirm('Are you sure you wish to delete this saved credit card? This cannot be undone') == true) {
            var card = getCardByID(id);
            SavedCreditCard.delete(card, function() {
                SavedCreditCard.query(function(cards) {
                    $scope.tempOrder.CreditCardID = null;
                    $scope.tempOrder.SavedCards = cards;
                });
            });
        }
    };
    $scope.showDelete = function(id) {
        if (id == null) return false;
        var card = getCardByID(id);
        return card.IsCustEditable;
    };
}]);

