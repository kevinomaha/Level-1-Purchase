four51.app.factory('RecipientList', ['$resource', '$451',
function($resource, $451) {
	function _then(fn, data) {
		if (angular.isFunction(fn))
			fn(data);
	}

	var _validate = function(list,digitalProduct) {

		if (list) {
			for (var i = 0; i < list.length; i++) {
				if (digitalProduct) {
					list[i].Invalid = list[i].Email.length ? false : true;
				}
				else {
					var recipient = list[i];
					if (recipient.ShipToFirstName == "" || recipient.ShipToLastName == "" ||
						recipient.Street1 == "" || recipient.City == "" ||
						recipient.State == "" || recipient.Zip == "" ||
						recipient.Country == "" ||
						!recipient.ShipToFirstName || !recipient.ShipToLastName ||
						!recipient.Street1 || !recipient.City ||
						!recipient.State || !recipient.Zip ||
						!recipient.Country)
					{
						list[i].Invalid = true;
					}
					else
					{
						list[i].Invalid = false;
					}
				}
			}
		}
	}

	return {
		validate: _validate
	}
}]);