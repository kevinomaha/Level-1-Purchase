four51.app.factory('ExistingAddress', function() {
	function _check(addresses,userAddress) {
		userAddress.IsExisting = false;
		userAddress.AddressID = null;
		for (var a = 0; a < addresses.length; a++) {
			var errorCnt = 0;
			var listAddress = addresses[a];
			if (!listAddress.IsShipping) return;

			listAddress.FirstName != userAddress.FirstName ?  errorCnt++ : null;
			listAddress.LastName != userAddress.LastName ?  errorCnt++ : null;
			listAddress.Street1 != userAddress.Street1 ?  errorCnt++ : null;
			listAddress.Street2 != userAddress.Street2 ?  errorCnt++ : null;
			listAddress.City != userAddress.City ?  errorCnt++ : null;
			listAddress.State != userAddress.State ?  errorCnt++ : null;
			listAddress.Zip != userAddress.Zip ?  errorCnt++ : null;
			listAddress.Country != userAddress.Country ?  errorCnt++ : null;
			listAddress.Phone != userAddress.Phone ?  errorCnt++ : null;

			if (errorCnt == 0) {
				userAddress.IsExisting = true;
				userAddress.AddressID = listAddress.ID;
				return;
			}
		}
	}

	return {
		check: _check
	}
});