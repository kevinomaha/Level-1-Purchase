four51.app.directive('angularPaste', ['$parse', '$rootScope', '$document', 'ExistingAddress', 'Address', 'Resources', 'RecipientUpload',
function ($parse, $rootScope, $document, ExistingAddress, Address, Resources, RecipientUpload) {
		return {
			restrict:'E',
			templateUrl:'partials/GC/angularPaste.html',
			link:function ($scope, element, attrs) {

                var today = new Date();
                var maxDate = new Date(today.setDate(today.getDate() + 120));
				var inFocus = false;

                var uploadSettings = RecipientUpload;

                function validateEmail(email) {
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    //var re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.(?:[A-Z]{2}|com|org|net)$/
                    return re.test(email);
                }

                function parseTabular(text, digital) {
					var toReturn = [];
					try {
                        text = text.replace(/"/g,'');
                        var rows = text.split(/[\n\f\r]/);
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].split("\t").length < (digital ? uploadSettings.Files['Digital'].length : uploadSettings.Files['Physical'].length)) {
                                if (rows[i+1] || rows[i+1] == "") {
                                    rows[i] = rows[i] + "\n";
                                    rows[i] = rows[i].concat(rows[i+1]);
                                    rows.splice(i+1,1);
                                    i--;
                                }
                            }
                        }
                        if (rows[0] && (rows[0].split("\t").length < (digital ? uploadSettings.Files['Digital'].length : uploadSettings.Files['Physical'].length) || rows[0].split("\t").length > (digital ? uploadSettings.Files['Digital'].length : uploadSettings.Files['Physical'].length))) {
                            $scope.tempPasteError = true;
                            $scope.columnLengthError = true;
                        }
                        else {
                            rows.forEach(function (thisRow) {
                                var row = thisRow;
                                if (row != '') {
                                    var cols = row.split("\t");
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
                    var text = $('#myPasteBox').val();
                    var stateList = Resources.states;
                    var spreadsheetColumns = uploadSettings.Files[$scope.selectedProduct.IsDigital ? 'Digital' : 'Physical'];
                    if (text != '') {
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text, $scope.selectedProduct.IsDigital);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var recipientPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        if ($scope.parsedPaste[i][0] != spreadsheetColumns[0].Name) {
                                            var recipient = {};
                                            recipient.Address = {};
                                            recipient.Address.Country = 'US';
                                            recipient.Address.IsShipping = true;
                                            recipient.Invalid = false;
                                            recipient.ErrorMessage = null;
                                            recipient.Selected = false;
                                            recipient.AwardCount = 0;

                                            for (var c = 0; c < spreadsheetColumns.length; c++) {
                                                var thisColumn = spreadsheetColumns[c];
                                                if (thisColumn.Mapping.Type == 'Spec') {
                                                    recipient[thisColumn.Mapping.Data] = $scope.parsedPaste[i][c];
                                                }
                                                else if (spreadsheetColumns[c].Mapping.Type == 'Address') {
                                                    recipient.Address[thisColumn.Mapping.Data] = $scope.parsedPaste[i][c];
                                                }
                                            }

                                            if (!$scope.selectedProduct.IsDigital) {
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
                                                    recipient.Address.Zip == "")
                                                {
                                                    recipient.AddressInvalid = true;
                                                    recipient.Invalid = true;
                                                }
                                                else {
                                                    recipient.AddressInvalid = false;
                                                    recipient.Invalid = false;
                                                }
                                            }

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
                    $scope.tempRecipientPasteList = [];
                    $scope.tempPasteError = false;
                    var spreadsheetColumns = uploadSettings.Files[$scope.selectedProduct.IsDigital ? 'Digital' : 'Physical'];
                    var text = $('#myPasteBox').val();
                    if (text != '') {
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text, $scope.selectedProduct.IsDigital);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var recipientPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        if ($scope.parsedPaste[i][0] != spreadsheetColumns[0].Name) {
                                            var recipient = {};
                                            recipient.Address = {};
                                            recipient.ErrorMessage = [];
                                            recipient.Invalid = false;
                                            recipient.Selected = false;
                                            recipient.AwardCount = 0;
                                            var missingFields = [];
                                            var errorCount = 0;

                                            var recipientIdentifier = (recipient.FirstName && recipient.LastName)
                                                ? recipient.FirstName + " " + recipient.LastName
                                                : "Recipient " + (i + 1);

                                            for (var c = 0; c < spreadsheetColumns.length; c++) {
                                                var thisColumn = spreadsheetColumns[c];
                                                if (thisColumn.Mapping.Type == 'Spec') {
                                                    recipient[thisColumn.Mapping.Data] = $scope.parsedPaste[i][c];
                                                }
                                                else if (spreadsheetColumns[c].Mapping.Type == 'Address') {
                                                    recipient.Address[thisColumn.Mapping.Data] = $scope.parsedPaste[i][c];
                                                }

                                                if (thisColumn.Required && !$scope.parsedPaste[i][c]) {
                                                    recipient.Invalid = true;
                                                    errorCount++;
                                                    missingFields.push(thisColumn.Name);
                                                }
                                            }

                                            if (errorCount > 0) {
                                                //$scope.tempPasteError = true;
                                                var missingFieldsMessage = recipientIdentifier + " is missing the following fields: ";
                                                for (var e = 0; e < missingFields.length; e++) {
                                                    if (e < missingFields.length - 1) {
                                                        missingFieldsMessage += " " + missingFields[e] + ",";
                                                    }
                                                    else {
                                                        missingFieldsMessage += " " + missingFields[e];
                                                    }
                                                }
                                                recipient.ErrorMessage.push(missingFieldsMessage);
                                            }

                                            if (recipient.Denomination && recipient.Denomination !== '') {
                                                var denom = parseFloat(recipient.Denomination.replace('$', '').replace(',', ''));
                                                if (denom === NaN || denom < 5 || denom > 2000) {
                                                    recipient.Invalid = true;
                                                    $scope.tempPasteError = true;
                                                    recipient.ErrorMessage.push(recipientIdentifier + " has an invalid denomination.");
                                                }
                                                else if (denom >= 5 && denom <= 500) {
                                                    if (denom % 5 !== 0) {
                                                        recipient.Invalid = true;
                                                        $scope.tempPasteError = true;
                                                        recipient.ErrorMessage.push(recipientIdentifier + " has an invalid denomination.");
                                                    }
                                                }
                                                else if (denom > 500 && denom <= 2000) {
                                                    if (denom % 25 !== 0) {
                                                        recipient.Invalid = true;
                                                        $scope.tempPasteError = true;
                                                        recipient.ErrorMessage.push(recipientIdentifier + " has an invalid denomination.");
                                                    }
                                                }
                                            }

                                            if (recipient.FutureShipDate !== '' && recipient.FutureShipDate) {
                                                var dateArray = recipient.FutureShipDate.split('/');
                                                var tempDate = new Date(dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1]);
                                                if (!isNaN(tempDate.getTime())) {
                                                    if (tempDate > maxDate) {
                                                        recipient.Invalid = true;
                                                        $scope.tempPasteError = true;
                                                        recipient.ErrorMessage.push(recipientIdentifier + " has a future delivery date that exceeds the limit of 120 days in the future. This date will not be uploaded.");
                                                    }
                                                } else {
                                                    recipient.Invalid = true;
                                                    $scope.tempPasteError = true;
                                                    recipient.ErrorMessage.push(recipientIdentifier + " has an invalid future delivery date. This date will not be uploaded.");
                                                }
                                            }

                                            if ((recipient.EmailAddress && !validateEmail(recipient.EmailAddress)) || (recipient.RecipientEmailAddress && !validateEmail(recipient.RecipientEmailAddress))) {
                                                recipient.Invalid = true;
                                                $scope.tempPasteError = true;
                                                recipient.ErrorMessage.push(recipientIdentifier + " has an invalid email address. This email address will not be uploaded.");
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