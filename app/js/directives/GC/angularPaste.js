four51.app.directive('angularPaste', ['$parse', '$rootScope', '$document', 'ExistingAddress', 'Address', 'Resources',
function ($parse, $rootScope, $document, ExistingAddress, Address, Resources) {
		return {
			restrict:'E',
			templateUrl:'partials/GC/angularPaste.html',
			link:function ($scope, element, attrs) {

				//We do not want to eat up chars if some text box is focussed
				//this variable will be set to true if focus is currently on
				//a textbox
				var inFocus = false;

				function parseTabular(text) {
					//The array we will return
					var toReturn = [];
					try {
						//Pasted data split into rows
                        text = text.replace(/"/g,'');
						var rows = text.split(/[\n\f\r]/);
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].split("\t").length < 20) {
                                if (rows[i+1]) {
                                    rows[i] = rows[i].concat(rows[i+1]);
                                    rows.splice(i+1,1);
                                    i--;
                                }
                            }
                        }
                        if (rows[0] && (rows[0].split("\t").length < 20 || rows[0].split("\t").length > 20)) {
                            $scope.tempPasteError = true;
                            $scope.columnLengthError = true;
                        }
                        else {
                            rows.forEach(function (thisRow) {
                                //var row = thisRow.trim();
                                var row = thisRow;
                                if (row != '') {
                                    var cols = row.split("\t");
                                    if (cols.length < 13) { cols.unshift('');}
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
                    //var text = $('#myPasteBox').val().replace(/(\r\n|\n|\r)/gm,"").replace(/"/g,'');
                    var text = $('#myPasteBox').val();
					var stateList = Resources.states;
					if (text != '') {
						//We need to change the scope values
						$scope.$apply(function () {
							if (attrs.ngModel != undefined && attrs.ngModel != '') {
								$parse(attrs.ngModel).assign($scope, text);
							}
							if (attrs.ngArray != undefined && attrs.ngArray != '') {
								var asArray = parseTabular(text);
								if (asArray != null) {
									$parse(attrs.ngArray).assign($scope, asArray);
									var recipientPasteList = [];
									for (var i = 0; i < $scope.parsedPaste.length; i++) {
										var recipient = {};

                                        var denom = ($scope.parsedPaste[i][14].indexOf('$') > -1) ? $scope.parsedPaste[i][14] : '$' + $scope.parsedPaste[i][14];
                                        denom = (denom == '$') ? '' : denom;

										recipient.FirstName = $scope.parsedPaste[i][0];
										recipient.LastName = $scope.parsedPaste[i][1];
										recipient.RecipientID = $scope.parsedPaste[i][2];
                                        recipient.EnvelopeLineTwo = $scope.parsedPaste[i][3];
                                        recipient.Email = $scope.parsedPaste[i][4];
										recipient.ShipToFirstName = $scope.parsedPaste[i][5];
										recipient.ShipToLastName = $scope.parsedPaste[i][6];
										recipient.CompanyName = $scope.parsedPaste[i][7];
										recipient.Street1 = $scope.parsedPaste[i][8];
										recipient.Street2 = $scope.parsedPaste[i][9];
										recipient.City = $scope.parsedPaste[i][10];
										recipient.State = $scope.parsedPaste[i][11];
										recipient.Zip = $scope.parsedPaste[i][12];
										recipient.Phone = $scope.parsedPaste[i][13];
										recipient.Denomination = denom;
										recipient.OpeningMessage = $scope.parsedPaste[i][15];
										recipient.PersonalMessage = $scope.parsedPaste[i][16];
										recipient.ClosingMessage = $scope.parsedPaste[i][17];
										recipient.EmailSubject = $scope.parsedPaste[i][18];
										recipient.DeliveryDate = $scope.parsedPaste[i][19];

										var stateValid = false;
										angular.forEach(stateList, function(state) {
											if (state.value == recipient.State) {
												stateValid = true;
											}
										});
										if (!stateValid) {
											recipient.State = "";
											recipient.Country = "";
										}
										else {
											for (var s = 0; s < stateList.length; s++) {
												if (recipient.State == stateList[s].value) {
													recipient.Country = stateList[s].country;
												}
											}
										}

										if (recipient.ShipToFirstName == "" ||
											recipient.ShipToLastName == "" ||
											recipient.Street1 == "" ||
											recipient.City == "" ||
											recipient.State == "" ||
											!stateValid ||
											recipient.Zip == "")
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

				//Directive was not firing on first attempt after login, or after clearing cache
				//Broadcasting from MainGCPurchaseCtrl
				$rootScope.$on('event:recipientspasted', textChanged);

				$rootScope.$on('event:generaterecipients', uploadList);

                $rootScope.$on('event:cancelUpload', clearList);

				function textChanged() {
					$scope.tempRecipientPasteList = [];
					$scope.tempPasteError = false;
					var stateList = Resources.states;
					//var text = $('#myPasteBox').val().replace(/(\r\n|\n|\r)/gm,"").replace(/"/g,'');
                    var text = $('#myPasteBox').val();
					if (text != '') {
						//We need to change the scope values
						$scope.$apply(function () {
							if (attrs.ngModel != undefined && attrs.ngModel != '') {
								$parse(attrs.ngModel).assign($scope, text);
							}
							if (attrs.ngArray != undefined && attrs.ngArray != '') {
								var asArray = parseTabular(text);
								if (asArray != null) {
									$parse(attrs.ngArray).assign($scope, asArray);
									var recipientPasteList = [];
									for (var i = 0; i < $scope.parsedPaste.length; i++) {
										var recipient = {};

                                        var denom = ($scope.parsedPaste[i][14].indexOf('$') > -1) ? $scope.parsedPaste[i][14] : '$' + $scope.parsedPaste[i][14];
                                        denom = (denom == '$') ? '' : denom;

                                        recipient.FirstName = $scope.parsedPaste[i][0];
                                        recipient.LastName = $scope.parsedPaste[i][1];
                                        recipient.RecipientID = $scope.parsedPaste[i][2];
                                        recipient.EnvelopeLineTwo = $scope.parsedPaste[i][3];
                                        recipient.Email = $scope.parsedPaste[i][4];
                                        recipient.ShipToFirstName = $scope.parsedPaste[i][5];
                                        recipient.ShipToLastName = $scope.parsedPaste[i][6];
                                        recipient.CompanyName = $scope.parsedPaste[i][7];
                                        recipient.Street1 = $scope.parsedPaste[i][8];
                                        recipient.Street2 = $scope.parsedPaste[i][9];
                                        recipient.City = $scope.parsedPaste[i][10];
                                        recipient.State = $scope.parsedPaste[i][11];
                                        recipient.Zip = $scope.parsedPaste[i][12];
                                        recipient.Phone = $scope.parsedPaste[i][13];
                                        recipient.Denomination = denom;
                                        recipient.OpeningMessage = $scope.parsedPaste[i][15];
                                        recipient.PersonalMessage = $scope.parsedPaste[i][16];
                                        recipient.ClosingMessage = $scope.parsedPaste[i][17];
                                        recipient.EmailSubject = $scope.parsedPaste[i][18];
                                        recipient.DeliveryDate = $scope.parsedPaste[i][19];
										recipient.Invalid = false;
										recipient.ErrorMessage = null;
										recipient.Selected = false;
										recipient.AwardCount = 0;

										if ($scope.selectedProduct && $scope.digitalProduct) {
											if (recipient.Email.length > 0) {
												recipient.Invalid = false;
												recipient.ErrorMessage = null;
											}
											else {
												$scope.tempPasteError = true;
												recipient.Invalid = true;
												recipient.ErrorMessage = "Recipient " + (i + 1) + " is missing an email address";
											}
										}
										else if ($scope.selectedProduct && !$scope.digitalProduct) {
											var stateValid = false;
											angular.forEach(stateList, function(state) {
												if (state.value == recipient.State) {
													stateValid = true;
												}
											});
											if (!stateValid) {
												recipient.State = "";
												recipient.Country = "";
											}
											else {
												for (var s = 0; s < stateList.length; s++) {
													if (recipient.State == stateList[s].value) {
														recipient.Country = stateList[s].country;
													}
												}
											}

											var errorCnt = 0;
											var errors = [];
											if (recipient.ShipToFirstName == "") {
												errorCnt++;
												errors.push("Ship To First Name");
											}
											if (recipient.ShipToLastName == "") {
												errorCnt++;
												errors.push("Ship To Last Name");
											}
											if (recipient.Street1 == "") {
												errorCnt++;
												errors.push("Address Line 1");
											}
											if (recipient.City == "") {
												errorCnt++;
												errors.push("City");
											}
											if (recipient.State == "") {
												errorCnt++;
												errors.push("State");
											}
											if (!stateValid) {
												errorCnt++;
												errors.push("State value is invalid");
											}
											if (recipient.Zip == "") {
												errorCnt++;
												errors.push("Zip Code");
											}

											if (errorCnt > 0) {
												$scope.tempPasteError = true;
												recipient.Invalid = true;
                                                var recipientIdentifier = (recipient.FirstName != "" && recipient.LastName != "")
                                                    ? recipient.FirstName + " " + recipient.LastName
                                                    : "Recipient " + (i + 1);
												recipient.ErrorMessage = recipientIdentifier + " is missing the following fields: ";
												for (var e = 0; e < errors.length; e++) {
													if (e < errors.length - 1) {
														recipient.ErrorMessage += " " + errors[e] + ",";
													}
													else {
														recipient.ErrorMessage += " " + errors[e];
													}
												}
											}
										}

										recipientPasteList.push(recipient);
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
					//Handles the Ctrl + V keys for pasting
					function handleKeyDown(e, args) {
						if (!inFocus && e.which == keyCodes.V && (e.ctrlKey || e.metaKey)) {    // CTRL + V
							//reset value of our box
							//$('#myPasteBox').val('');
							//set it in focus so that pasted text goes inside the box
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