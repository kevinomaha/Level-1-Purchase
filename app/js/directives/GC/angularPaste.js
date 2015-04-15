four51.app.directive('angularPaste', ['$parse', '$rootScope', '$document', 'ExistingAddress', 'Address', 'Resources',
function ($parse, $rootScope, $document, ExistingAddress, Address, Resources) {
		return {
			restrict:'E',
			templateUrl:'partials/GC/angularPaste.html',
			link:function ($scope, element, attrs) {

				var inFocus = false;

                function validateEmail(email) {
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }

                function parseTabular(text, digital) {
					var toReturn = [];
					try {
                        text = text.replace(/"/g,'');
                        var rows = text.split(/[\n\f\r]/);
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].split("\t").length < (digital ? 8 : 16)) {
                                if (rows[i+1] || rows[i+1] == "") {
                                    rows[i] = rows[i] + "\n";
                                    rows[i] = rows[i].concat(rows[i+1]);
                                    rows.splice(i+1,1);
                                    i--;
                                }
                            }
                        }
                        if (rows[0] && (rows[0].split("\t").length < (digital ? 8 : 16) || rows[0].split("\t").length > (digital ? 8 : 16))) {
                            $scope.tempPasteError = true;
                            $scope.columnLengthError = true;
                        }
                        else {
                            rows.forEach(function (thisRow) {
                                var row = thisRow;
                                if (row != '') {
                                    var cols = row.split("\t");
                                    //if (cols.length < 13) { cols.unshift('');}
                                    toReturn.push(cols);
                                }
                            });
                        }
					}
					catch (err) {
						console.log('error parsing as tabular data');
						console.log(err);
						return null;
					}
					return toReturn;
				}

                function uploadList() {
                    if ($scope.selectedProduct.IsDigital) {
                        uploadListDigital();
                    }
                    else {
                        uploadListPhysical();
                    }
                }

				function uploadListDigital() {
                    var text = $('#myPasteBox').val();
					if (text != '') {
						$scope.$apply(function () {
							if (attrs.ngModel != undefined && attrs.ngModel != '') {
								$parse(attrs.ngModel).assign($scope, text);
							}
							if (attrs.ngArray != undefined && attrs.ngArray != '') {
								var asArray = parseTabular(text, true);
								if (asArray != null) {
									$parse(attrs.ngArray).assign($scope, asArray);
									var recipientPasteList = [];
									for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        if ($scope.parsedPaste[i][0] != "Recipient First Name") {
                                            var recipient = {};

                                            recipient.FirstName = $scope.parsedPaste[i][0];
                                            recipient.LastName = $scope.parsedPaste[i][1];
                                            recipient.EmailAddress = $scope.parsedPaste[i][2];
                                            recipient.EmployeeNumber = $scope.parsedPaste[i][3];
                                            recipient.Marketplace = $scope.parsedPaste[i][4];
                                            recipient.JobFamily = $scope.parsedPaste[i][5];
                                            recipient.Supervisor = $scope.parsedPaste[i][6];
                                            recipient.ADPCompanyCode = $scope.parsedPaste[i][7];
                                            recipient.Address = {};

                                            if (!validateEmail(recipient.EmailAddress)) {
                                                recipient.EmailAddress = "";
                                            }
                                            recipient.ErrorMessage = null;
                                            recipient.Selected = false;
                                            recipient.AwardCount = 0;

                                            recipientPasteList.push(recipient);
                                        }
									}

									$scope.tempPasteError = false;
									$scope.recipientPasteList =  recipientPasteList;
								}
							}
						});
					}
				}

                function uploadListPhysical() {
                    var text = $('#myPasteBox').val();
                    var stateList = Resources.states;
                    if (text != '') {
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text, false);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var recipientPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        if ($scope.parsedPaste[i][0] != "Recipient First Name") {
                                            var recipient = {};

                                            recipient.FirstName = $scope.parsedPaste[i][0];
                                            recipient.LastName = $scope.parsedPaste[i][1];
                                            recipient.EmployeeNumber = $scope.parsedPaste[i][2];
                                            recipient.Marketplace = $scope.parsedPaste[i][3];
                                            recipient.JobFamily = $scope.parsedPaste[i][4];
                                            recipient.Supervisor = $scope.parsedPaste[i][5];
                                            recipient.ADPCompanyCode = $scope.parsedPaste[i][6];
                                            recipient.Address = {};
                                            recipient.Address.FirstName = $scope.parsedPaste[i][7];
                                            recipient.Address.LastName = $scope.parsedPaste[i][8];
                                            recipient.Address.CompanyName = $scope.parsedPaste[i][9];
                                            recipient.Address.Street1 = $scope.parsedPaste[i][10];
                                            recipient.Address.AddressName = recipient.Address.Street1;
                                            recipient.Address.Street2 = $scope.parsedPaste[i][11];
                                            recipient.Address.City = $scope.parsedPaste[i][12];
                                            recipient.Address.State = $scope.parsedPaste[i][13];
                                            recipient.Address.Zip = $scope.parsedPaste[i][14];
                                            recipient.Address.Phone = $scope.parsedPaste[i][15];
                                            recipient.Address.Country = 'US';
                                            recipient.Address.IsShipping = true;

                                            var stateValid = false;
                                            angular.forEach(stateList, function(state) {
                                                if (state.value == recipient.Address.State) {
                                                    stateValid = true;
                                                }
                                            });
                                            if (!stateValid) {
                                                recipient.Address.State = "";
                                                recipient.Address.Country = "";
                                            }
                                            else {
                                                for (var s = 0; s < stateList.length; s++) {
                                                    if (recipient.Address.State == stateList[s].value) {
                                                        recipient.Address.Country = stateList[s].country;
                                                    }
                                                }
                                            }

                                            if (recipient.Address.FirstName == "" ||
                                                recipient.Address.LastName == "" ||
                                                recipient.Address.Street1 == "" ||
                                                recipient.Address.City == "" ||
                                                recipient.Address.State == "" ||
                                                !stateValid ||
                                                recipient.Address.Zip == "" ||
                                                recipient.Address.Phone == "")
                                            {
                                                recipient.AddressInvalid = true;
                                                recipient.Invalid = true;
                                            }
                                            else {
                                                recipient.AddressInvalid = false;
                                                recipient.Invalid = false;
                                            }
                                            recipient.ErrorMessage = null;
                                            recipient.Selected = false;
                                            recipient.AwardCount = 0;

                                            recipientPasteList.push(recipient);
                                        }
                                    }

                                    $scope.tempPasteError = false;
                                    $scope.recipientPasteList =  recipientPasteList;
                                }
                            }
                        });
                    }
                }

				$('#myPasteBox').on('paste', function() {
					setTimeout(function() {
						textChanged();
					},5);
				});

				$rootScope.$on('event:recipientspasted', textChanged);

				$rootScope.$on('event:generaterecipients', uploadList);

                $rootScope.$on('event:cancelUpload', clearList);

                function textChanged() {
                    if ($scope.selectedProduct.IsDigital) {
                        digitalTextChanged();
                    }
                    else {
                        physicalTextChanged();
                    }
                }

                function digitalTextChanged() {
                    $scope.tempRecipientPasteList = [];
                    $scope.tempPasteError = false;
                    var text = $('#myPasteBox').val();
                    if (text != '') {
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text, true);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var recipientPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        if ($scope.parsedPaste[i][0] != "Recipient First Name") {
                                            var recipient = {};

                                            recipient.FirstName = $scope.parsedPaste[i][0];
                                            recipient.LastName = $scope.parsedPaste[i][1];
                                            recipient.EmailAddress = $scope.parsedPaste[i][2];
                                            recipient.EmployeeNumber = $scope.parsedPaste[i][3];
                                            recipient.Marketplace = $scope.parsedPaste[i][4];
                                            recipient.JobFamily = $scope.parsedPaste[i][5];
                                            recipient.Supervisor = $scope.parsedPaste[i][6];
                                            recipient.ADPCompanyCode = $scope.parsedPaste[i][7];
                                            recipient.Address = {};
                                            recipient.Invalid = false;
                                            recipient.ErrorMessage = [];
                                            recipient.Selected = false;
                                            recipient.AwardCount = 0;

                                            var recipientIdentifier = (recipient.FirstName != "" && recipient.LastName != "")
                                                ? recipient.FirstName + " " + recipient.LastName
                                                : "Recipient " + (i + 1);

                                            if (recipient.EmailAddress && !validateEmail(recipient.EmailAddress)) {
                                                recipient.Invalid = true;
                                                $scope.tempPasteError = true;
                                                recipient.ErrorMessage.push(recipientIdentifier + " has an invalid email address. This email address will not be uploaded.");
                                            }
                                            if (recipient.EmailAddress.length == 0) {
                                                $scope.tempPasteError = true;
                                                recipient.Invalid = true;
                                                recipient.ErrorMessage.push(recipientIdentifier + " is missing an email address");
                                            }
                                            recipientPasteList.push(recipient);
                                        }
                                    }

                                    $scope.tempRecipientPasteList =  recipientPasteList;
                                }
                            }
                        });
                    }
                }

                function physicalTextChanged() {
                    $scope.tempRecipientPasteList = [];
                    $scope.tempPasteError = false;
                    var stateList = Resources.states;
                    var text = $('#myPasteBox').val();
                    if (text != '') {
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text, false);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var recipientPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        if ($scope.parsedPaste[i][0] != "Recipient First Name") {
                                            var recipient = {};

                                            recipient.FirstName = $scope.parsedPaste[i][0];
                                            recipient.LastName = $scope.parsedPaste[i][1];
                                            recipient.EmployeeNumber = $scope.parsedPaste[i][2];
                                            recipient.Marketplace = $scope.parsedPaste[i][3];
                                            recipient.JobFamily = $scope.parsedPaste[i][4];
                                            recipient.Supervisor = $scope.parsedPaste[i][5];
                                            recipient.ADPCompanyCode = $scope.parsedPaste[i][6];
                                            recipient.Address = {};
                                            recipient.Address.FirstName = $scope.parsedPaste[i][7];
                                            recipient.Address.LastName = $scope.parsedPaste[i][8];
                                            recipient.Address.CompanyName = $scope.parsedPaste[i][9];
                                            recipient.Address.Street1 = $scope.parsedPaste[i][10];
                                            recipient.Address.AddressName = recipient.Address.Street1;
                                            recipient.Address.Street2 = $scope.parsedPaste[i][11];
                                            recipient.Address.City = $scope.parsedPaste[i][12];
                                            recipient.Address.State = $scope.parsedPaste[i][13];
                                            recipient.Address.Zip = $scope.parsedPaste[i][14];
                                            recipient.Address.Phone = $scope.parsedPaste[i][15];
                                            recipient.Address.Country = 'US';
                                            recipient.Address.IsShipping = true;
                                            recipient.Invalid = false;
                                            recipient.ErrorMessage = [];
                                            recipient.Selected = false;
                                            recipient.AwardCount = 0;

                                            var errorCnt = 0;
                                            var errors = [];

                                            var recipientIdentifier = (recipient.FirstName != "" && recipient.LastName != "")
                                                ? recipient.FirstName + " " + recipient.LastName
                                                : "Recipient " + (i + 1);

                                            var stateValid = false;
                                            angular.forEach(stateList, function(state) {
                                                if (state.value == recipient.Address.State) {
                                                    stateValid = true;
                                                }
                                            });
                                            if (!stateValid) {
                                                recipient.Address.State = "";
                                                recipient.Address.Country = "";
                                            }
                                            else {
                                                for (var s = 0; s < stateList.length; s++) {
                                                    if (recipient.Address.State == stateList[s].value) {
                                                        recipient.Address.Country = stateList[s].country;
                                                    }
                                                }
                                            }

                                            if (recipient.Address.FirstName == "") {
                                                errorCnt++;
                                                errors.push("Ship To First Name");
                                            }
                                            if (recipient.Address.LastName == "") {
                                                errorCnt++;
                                                errors.push("Ship To Last Name");
                                            }
                                            if (recipient.Address.Street1 == "") {
                                                errorCnt++;
                                                errors.push("Address Line 1");
                                            }
                                            if (recipient.Address.City == "") {
                                                errorCnt++;
                                                errors.push("City");
                                            }
                                            if (recipient.Address.State == "") {
                                                errorCnt++;
                                                errors.push("State");
                                            }
                                            if (!stateValid) {
                                                errorCnt++;
                                                errors.push("State value is invalid");
                                            }
                                            if (recipient.Address.Zip == "") {
                                                errorCnt++;
                                                errors.push("Zip Code");
                                            }
                                            if (recipient.Address.Phone == "") {
                                                errorCnt++;
                                                errors.push("Phone");
                                            }

                                            if (errorCnt > 0) {
                                                $scope.tempPasteError = true;
                                                recipient.Invalid = true;
                                                var addressError = recipientIdentifier + " is missing the following fields: ";
                                                for (var e = 0; e < errors.length; e++) {
                                                    if (e < errors.length - 1) {
                                                        addressError += " " + errors[e] + ",";
                                                    }
                                                    else {
                                                        addressError += " " + errors[e];
                                                    }
                                                }
                                                recipient.ErrorMessage.push(addressError);
                                            }
                                            recipientPasteList.push(recipient);
                                        }
                                    }

                                    $scope.tempRecipientPasteList =  recipientPasteList;
                                }
                            }
                        });
                    }
                }

                function clearList() {
                    $scope.tempRecipientPasteList = [];
                    $scope.recipientPasteList = [];
                    $('#myPasteBox').val('');
                }


				$document.ready(function () {
					function handleKeyDown(e, args) {
						if (!inFocus && e.which == keyCodes.V && (e.ctrlKey || e.metaKey)) {
							$('#myPasteBox').focus();
						}
					}

					$("#uploadRecipients").bind('click', uploadList);
					$("#clearPaste").bind('click', function(){
                        $('#myPasteBox').val('');
                    });
				});
			}
		}
}]);