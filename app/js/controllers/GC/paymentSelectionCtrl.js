four51.app.controller('PaymentSelectionController', ['$scope', '$rootScope', 'SavedCreditCard',
function ($scope, $rootScope, SavedCreditCard) {
	$scope.setPaymentMethod = function(type) {
		$scope.currentOrder.PaymentMethod = type;
		$rootScope.$broadcast('event:paymentMethodChange', type);
	};

	$scope.setBudgetAccount = function(count) {
		$scope.setPaymentMethod('BudgetAccount');
		//if ($scope.currentOrder.BudgetAccountID || count > 1) return;
		angular.forEach($scope.SpendingAccounts, function(a) {
			if (a.AccountType.PurchaseCredit) {
				$scope.currentOrder.BudgetAccountID = a.ID;
				$scope.selectedBudgetAccount = a;
			}
		});
        angular.forEach($scope.addresses, function(a) {
            if (a.IsBilling && !a.IsCustEditable) {
                $scope.currentOrder.BillAddressID = a.ID;
            }
        });
	};

    $scope.SavedCards = [];
    SavedCreditCard.query(function(cards) {
        $scope.SavedCards = cards;
    });

    $scope.$watch('currentOrder.BudgetAccountID', function() {
        if ($scope.currentOrder !== null) {
            if ($scope.currentOrder.BudgetAccountID && $scope.currentOrder.PaymentMethod != 'CreditCard') {
                $scope.setBudgetAccount();
            }
        }
    });

	$rootScope.$on('event:SpendingAccountUpdate', function(event, accounts) {
		if ($scope.currentOrder && $scope.currentOrder.PaymentMethod == 'BudgetAccount') {
			angular.forEach(accounts, function(a) {
				if ($scope.selectedBudgetAccount) return;
				if ($scope.currentOrder.BudgetAccountID == null && a.AccountType.PurchaseCredit) {
					$scope.currentOrder.BudgetAccountID = a.ID;
					$scope.selectedBudgetAccount = a;
				}
				else if (a.AccountType.PurchaseCredit && a.ID == $scope.currentOrder.BudgetAccountID) {
					$scope.selectedBudgetAccount = a;
				}
			});
		}
	});

    var getCardByID = function(id) {
        var selectedCard = null;
        angular.forEach($scope.SavedCards, function(card) {
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
                    $scope.currentOrder.CreditCardID = null;
                    $scope.SavedCards = cards;
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

