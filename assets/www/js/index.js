/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var currentuser;
var debug = false;
var geo = {};
var app = {
		// Application Constructor
		// changed line
		// changed this one too
		initialize: function() {
			this.bindEvents();

			// Manually fire this event when testing in desktop browsers
			// this.onDeviceReady();
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function() {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicity call 'app.receivedEvent(...);'
		onDeviceReady: function() {
			//$mysteryL1 = $("._mysteryL1Page");
			// set our device up with geo
			app.initializeGeo();

			// Init our parse SDK
			app.initializeParse();

			app.checkPreAuth();

			//$mysteryL1.show;
			//app.mysteryLevel1();

			// test parse connectivity
			// app.testParse();

			//app.setUpStartPage();

			//app.register();

			//app.login();

			// Query Parse for jounral entries
			//app.getJournalEntries();

			// hook up our UI events
			//app.initializeUI();
		},
		initializeGeo: function() {
			// Throw an error if no update is received every 30 seconds
			var options = { timeout: 30000 };
			this.watchID = navigator.geolocation.watchPosition(this.geoSuccess, this.geoError, options);
		},
		geoSuccess: function(position) {
			console.log("Geo success");

			geo.latitute = position.coords.latitude;
			geo.longitude = position.coords.longitude;
			geo.isSet = true;

			console.log(geo.latitute);
			console.log(geo.longitude);
		},
		geoError: function(error) {
			// Do nothing, just write some output
			console.log('code: '    + error.code    + '\n' +
					'message: ' + error.message + '\n');
		},
		initializeParse: function() {
			// Init with our app info and Key
			var parseAppID = "1kalBydVxE7TvD9E4dIjICRZ1tB9AHYO5FAFx8EX",
			parseApiKey = "LyOfui5o5kY940jsfDUbaoxg2ayRlifmxy6iUwv6";

			if (parseAppID == "" || parseApiKey == "") {
				alert("Setup a parse account and add your AppID and ApiKey in 'initializeParse'");
			}

			Parse.initialize(parseAppID, parseApiKey);

			// Setup our JournalEntryObject for interaction with Parse
			JournalEntryObject = Parse.Object.extend("JournalEntryObject");
			mysteryL1Obj = Parse.Object.extend("mysteryL1Obj");
			mysteryL2Obj = Parse.Object.extend("mysteryL2Obj");
			gameLevelObj = Parse.Object.extend("gameLevelObj");
		},
		testParse: function() {
			// Create a test object and try to save it
			var TestObject = Parse.Object.extend("TestObject");
			var testObject = new TestObject();

			testObject.save({foo: "bar"}, {
				success: function(object) {
					console.log("Parse Test Successful!");
				}
			});
		},

		checkPreAuth: function() {
			var self = this,
			$mainPage = $("._mainPage"),
			$mysteryGamePage = $("._mysteryGamePage"),
			$loginPage = $("._loginPage"),
			$regPage = $("._regPage");
			$gamePage = $("._gamePage");
			var clear = false;
			if(clear){
				window.localStorage.removeItem("username");
				window.localStorage.removeItem("password");
			}
			if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
				if(debug == true){
					alert("local storage found");
				}
				//$loginPage.hide();
				$mainPage.hide();
				$gamePage.show();
				app.gamePage();
				//app.startGame();
			}else{
				if(debug == true){
					alert("nothing in local storage");
				}
				app.setUpStartPage();
			}   	
		},

		gamePage: function(){
			var $gamePage = $("._gamePage"),
			$viewInstructions = $("._viewInstructions"),
			$mainPage = $("._mainPage");
			
			$gamePage.find("._viewMysteryGame").click(function(e){
				$gamePage.hide();	
				var query = new Parse.Query(gameLevelObj);

				query.equalTo("creator", Parse.User.current());

				query.find({
					success:function(results){
						if(results.length>0){
							var gameLevel = results[0].get('gameLevel');
							if(gameLevel == 0){
								if(debug == true)
									alert("goto start");
								app.startGame();
							}else if(gameLevel == 1){
								if(debug == true)
									alert("goto ml1");
								app.mysteryLevel1();
							}else if(gameLevel == 2){
								if(debug == true)
									alert("goto ml2");
								app.mysteryLevel2();
							}else{
								alert("unknown gamelevl: "+gameLevel)
							}
						}else{
							alert("could not find user gameLevel")
						}
					}
				});

			});

			$gamePage.find("._viewInstructionsBtn").click(function(e){
				if(debug == true)
					alert("viewInstructionsBtn clicked");
				$gamePage.hide();
				$viewInstructions.show();
				app.viewInstructions();
			});
			
			$gamePage.find("._logoutPageBtn").click(function(e){
				$gamePage.hide();
				app.logout();
				$mainPage.show();
			});


			/*
        	query.find({
                success:function(results) {
                	if(results.length>0){
                		alert("results size: "+results.length+", level: "+results[0].get('gameLevel'));
                		//alert("found user in Parse");
                		//$mysteryL1Page.show();
                		//app.testLevel1();
                		//app.mysteryLevel1();
                	}else{
                		alert("couldn't find gameLevel");
                	}
                },
                error:function(error) {


                }
            });
			 */


		},

		viewInstructions: function(){
			var $viewInstructions = $("._viewInstructions"),
			$gamePage = $("._gamePage");
			alert("in viewInstructions");
			$viewInstructions.find("._gamePageBtn").click(function(e){
				if(debug == true)
					alert("gamePageBtn clicked");
				$viewInstructions.hide();
				$gamePage.show();
				app.gamePage;
			});
		},

		setUpStartPage: function(){
			var self = this,
			$mainPage = $("._mainPage"),
			$mysteryGamePage = $("._mysteryGamePage"),
			$loginPage = $("._loginPage"),
			$regPage = $("._regPage");

			$mainPage.find("._loginPageBtn").click(function(e){
				$mainPage.hide();
				$mysteryGamePage.hide();
				$regPage.hide();
				$loginPage.show();
				app.login();
			});

			$mainPage.find("._regPageBtn").click(function(e){
				$mainPage.hide();
				$mysteryGamePage.hide();
				$regPage.show();
				$loginPage.hide();
				app.register();
			});

			$mainPage.find("._viewGame").click(function(e) {
				$mainPage.hide();
				$mysteryGamePage.show();
			});

			$mysteryGamePage.find("._homePage").click(function(e) {
				$mainPage.show();
				$mysteryGamePage.hide();
			});
		},

		login: function(){
			var self = this,
			$loginPage = $("._loginPage"),
			$mysteryL1Page = $("._mysteryL1Page"),
			$resetPassword = $("._resetPassword"),
			$gamePage = $("._gamePage"),
			$setUpStartPage = $("._mainPage"),
			$loading = $("#loading");

			$loginPage.find("._loginSubmitBtn").click(function(e) {
				
				if(debug == true)
					alert("button pressed");
				//get values
				var username = $("#username").val();
				var password = $("#password").val();

				//do some basic validation here
				var errors = "";
				if(username === "") errors += "Username required.<br/>";
				if(password === "") errors += "Password required.<br/>";

				if(errors !== "") {
					alert("Please enter a value");
					return;
				}

				//$("#regstatus").html("<b>Logging in...</b>");

				Parse.User.logIn(username, password, {
					success:function(user) {
						currentUser = Parse.User.current();
						//cylon.loadPage("./notes.html");
						if(debug == true)
							alert("logged in");
						$loginPage.hide();
						window.localStorage["username"] = username;
						window.localStorage["password"] = password;
						//app.startGame();
						$gamePage.show();
						app.gamePage();
					},
					error:function(user, error) {
						console.log("ERROR!");
						console.dir(error);
						alert("Sorry, you couldn't be logged in");
						//$("#loginstatus").html(error.message).addClass("errorDiv");
					}
				});
			});
			$loginPage.find("._returnBtn").click(function(e){
				$loginPage.hide();
				$setUpStartPage.show();
				app.setUpStartPage();
			});
			$loginPage.find("._resetPassBtn").click(function(e){
				$loginPage.hide();
				$resetPassword.show();
				app.resetPassword();
			});
		},
		
		logout: function(){
			if(debug== true)
				alert("in logout function");
			
			
			    // do stuff with the user
				Parse.User.logOut();
				 
				var currentUser = Parse.User.current();  // this will now be null
				if(currentUser == null){
					alert("user is logged out")	
					window.localStorage.removeItem("username");
					  window.localStorage.removeItem("password");
						app.setUpStartPage();

				}
		
			/*
			ParseUser currentUser = ParseUser.getCurrentUser();
			if (currentUser != null) {
			  // do stuff with the user
				alert("user is logged in");
				ParseUser.logOut();
				ParseUser currentUser2 = ParseUser.getCurrentUser(); // this will now be null
				if(currentUser2 == nul1){
					alert("user is logged out")
					ParseUser currentUser = ParseUser.getCurrentUser(); // this will now be null
				}
			} else {
			  // show the signup or login screen
			}

			*/
			
			/*
			Parse.User.logOut({
				  success: function() {
					  if(debug == true)
					  	alert("user logged out");
					  window.localStorage.removeItem("username");
					  window.localStorage.removeItem("password");
						app.setUpStartPage();

				  },
				  error: function(error) {
					  
				    // Show the error message somewhere
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
				*/
		},

		register: function(){
			var self = this,
			$regPage = $("._regPage"),
			$mainPage = $("._mainPage");

			$regPage.find("._regSubmitBtn").click(function(e) {
				if(debug == true)
					alert("register button pressed");
				var username = $("#usernameR").val();
				var password = $("#passwordR").val();
				var email = $("#emailR").val();
				//alert
				//do some basic validation here
				var errors = "";
				if(username === "") errors += "Username required.<br/>";
				if(password === "") errors += "Password required.<br/>";
				if(email === "") errors += "Email required.<br/>";

				if(errors !== "") {
					//$("#regstatus").html(errors).addClass("errorDiv");
					//return;
				}
				
				//alert(username+password+email);
				
				//try to register with Parse and see if it works.
				var user = new Parse.User();
				user.set("username", username);
				user.set("password", password);
				//user.set("gameLevel", 0);
				user.set("email", email);

				//$("#regstatus").html("<b>Registering user...</b>");
				alert("about to register user")
				user.signUp(null, {
					success:function(userResult) {
						if(debug == true)
							alert("registered user");
						//currentUser = user;

						var gameLO = new gameLevelObj();
						gameLO.set("creator",Parse.User.current());
						gameLO.setACL(new Parse.ACL(Parse.User.current()));
						gameLO.set("gameLevel",0);
						gameLO.save(null, {
							success:function(object) {
								console.log("Saved the game level object!");
								//$mysteryL1Page.show();
								//app.mysteryLevel1();

							}, 
							error:function(object,error) {
								console.dir(error);
							}
						});


						window.localStorage["username"] = username;
						window.localStorage["password"] = password;   
						$regPage.hide();
						app.startGame();
						//cylon.loadPage("./notes.html");
					},
					error:function(user, error) {
						alert("user could not be registered");
						console.log("ERROR!");
						console.dir(error);
						$("#regstatus").html(error.message).addClass("errorDiv");
					}
				});
			});
			$regPage.find("._returnBtn").click(function(e){
				$regPage.hide();
				$mainPage.show();
				app.setUpStartPage();
			});
		},

		resetPassword: function() {
			var self = this,
			$resetPassword = $("._resetPassword"),
			$loginPage = $("._loginPage"),
			$email = $("#resetEmail");

			if(debug == true)
				alert("in resetPassword function");

			//if(email === "") return;
			$resetPassword.find("._submitReset").click(function(e){
				var emailVal = $email.val();
				if(debug == true){
					alert("resetPassword btn clicked");
				}
				if(emailVal != ""){
					if(debug == true)
						alert("Password request being sent");
					Parse.User.requestPasswordReset(emailVal, {
						success:function() {
							alert("Reset instructions emailed to you.");
						},
						error:function(error) {
							alert(error.message);
						}
					});
				}else{
					alert("Please enter an e-mail");
				}
			});
			$resetPassword.find("._returnBtn").click(function(e){
				$resetPassword.hide();
				$loginPage.show();
				app.login();
			});

		},

		/*
    loadGamePage: function(){
    	var self = this,

    	$loginPage = $("._loginPage"),
    	$regPage = $("._regPage"),
    	$gamePage = $("._gamePage");

    	$gamePage.find("._viewMysteryGame").click(function(e){
    		//app.mysteryGame();
    		app.startGame();
    	});
    },
		 */

		startGame: function(){
			var self = this,
			$mysteryL1Page = $("._mysteryL1Page");

			var query = new Parse.Query(mysteryL1Obj);

			query.equalTo("creator", Parse.User.current());

			query.find({
				success:function(results) {
					if(results.length>0){
						alert("found user in Parse");
						$mysteryL1Page.show();
						//app.testLevel1();
						app.mysteryLevel1();
					}else{
						alert("User not found in Parse");
						var game = new mysteryL1Obj();
						game.set("creator",Parse.User.current());
						game.setACL(new Parse.ACL(Parse.User.current()));
						//game.set("gameLevel",1);
						game.set("clue1", "incomplete");
						game.set("clue2", "incomplete");
						game.set("clue3", "incomplete");
						game.set("clue4", "incomplete");
						game.set("clue5", "incomplete");   
						game.save(null, {
							success:function(object) {
								console.log("Saved the object!");

								var query = new Parse.Query(gameLevelObj);
								query.equalTo("creator", Parse.User.current());
								query.first({
									success:function(result) {
										if(result != undefined){
											alert("gameLevel found");
											result.set("gameLevel",1);
											result.save();
										}else{
											alert("couldn't update the game level to 1");
										}
									},
									error:function(error) { 
									}
								});

								$mysteryL1Page.show();
								app.mysteryLevel1();

							}, 
							error:function(object,error) {
								console.dir(error);
							}
						});
					}
				},
				error:function(error) {


				}
			});

			//var self = this;


		},

		initializeML2: function(){
			var $mysteryL1Page = $("._mysteryL1Page"),
			$mysteryL2Page = $("._mysteryL2Page");

			var query = new Parse.Query(mysteryL2Obj);

			query.equalTo("creator", Parse.User.current());
			//query.equalTo("gameLevel",2);

			query.find({
				success:function(results) {
					if(results.length>0){
						alert("found game level in Parse");
						$mysteryL2Page.show();
						//app.testLevel1();
						app.mysteryLevel2();
					}else{
						alert("game level not found in Parse");
						var game = new mysteryL2Obj();
						game.set("creator",Parse.User.current());
						game.setACL(new Parse.ACL(Parse.User.current()));
						//game.set("gameLevel",2);
						game.set("clue6", "incomplete");
						game.set("clue7", "incomplete");
						game.set("clue8", "incomplete");
						game.set("clue9", "incomplete");
						game.set("clue10", "incomplete");   

						game.save(null, {
							success:function(object) {
								console.log("Saved the object!");

								var query = new Parse.Query(gameLevelObj);
								query.equalTo("creator", Parse.User.current());
								query.first({
									success:function(result) {
										if(result != undefined){
											alert("gameLevel found");
											result.set("gameLevel",2);
											result.save();
										}else{
											alert("couldn't update the game level to 2");
										}
									},
									error:function(error) { 
									}
								});

								$mysteryL2Page.show();
								app.mysteryLevel2();

							}, 
							error:function(object,error) {
								console.dir(error);
							}
						});
					}
				},
				error:function(error) { 
				}
			});
		},


		mysteryLevel1: function() {
			var self = this,
			$mysteryL1Page = $("._mysteryL1Page"),
			$mysteryL2Page = $("._mysteryL2Page"),
			$gamePage = $("._gamePage"),
			$clue1Text = $("#clue1Text"),
			$clue2Text = $("#clue2Text"),
			$clue3Text = $("#clue3Text"),
			$clue4Text = $("#clue4Text"),
			$clue5Text = $("#clue5Text"),
			$level1Answer = $("#level1Answer");
			//$clue1TextArea= $("._clue1TextArea");

			$mysteryL1Page.show();

			if(debug == true)
				alert("entered this function");

			var checkIn1 = false;
			$mysteryL1Page.find("._checkInBtn1").click(function(e){
				if(debug == true);
					alert("button pressed");

				var lat, long, checkIn;
				type = "cafe";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				// onSuccess Geolocation
				//
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					alert("geolocation call worked: "+lat+", "+long);
					//$checkInPage.find("._checkInBtn").click(function(e){
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";
					alert(link);		

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							checkIn = "true";
							alert("checkin worked!!: ");
							//app.checkInWorked(clue,value);
							clue1Text.value="coffee";
							clue1Text.readOnly=true;
							app.parseSave(mysteryL1Obj, "clue1", "Coffee");

						}else{
							checkIn = "false";
							alert("not close enough");
						}
					});

				}

				// onError Callback receives a PositionError object
				//
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}

			});
			
			$mysteryL1Page.find("._checkInBtn2").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "bank";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue2Text.value="Tea";
							clue2Text.readOnly=true;
							app.parseSave(mysteryL1Obj, "clue2", "Tea");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}

			});
			$mysteryL1Page.find("._checkInBtn3").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "country";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue3Text.value="Sugar";
							clue3Text.readOnly=true;
							app.parseSave(mysteryL1Obj, "clue3", "Sugar");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}
			});
			$mysteryL1Page.find("._checkInBtn4").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "grocery_or_supermarket";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue4Text.value="Cream";
							clue4Text.readOnly=true;
							app.parseSave(mysteryL1Obj, "clue4", "Cream");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}
			});
			$mysteryL1Page.find("._checkInBtn5").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "gym";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue5Text.value="Cocoa";
							clue5Text.readOnly=true;
							app.parseSave(mysteryL1Obj, "clue5", "Cocoa");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}
			});

			$mysteryL1Page.find("._textaAreaBtn1").click(function(e){
				alert($clue1Text.val());
				if($clue1Text.val().toLowerCase()=="coffee"){
					alert("You are right!");
					clue1Text.readOnly=true;

					app.parseSave(mysteryL1Obj,"clue1",$clue1Text.val());

				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL1Page.find("._textaAreaBtn2").click(function(e){
				if($clue2Text.val().toLowerCase()=="tea"){
					alert("you are right!");
					clue2Text.readOnly=true; 
					
					app.parseSave(mysteryL1Obj,"clue2",$clue2Text.val());

					/*
					var query = new Parse.Query(mysteryL1Obj);
					query.equalTo("creator", Parse.User.current());
					query.first({
						success:function(results) {
							if(results != "undefined"){
								if(debug == true){
									alert("found object");
								}
								results.set("clue2",$clue2Text.val());
								results.save();
							}else{
								if(debug == true){
									alert("Database obj could not be updated");
								}
							}
						},
						error:function(error) { 
						}
					});
					*/
				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL1Page.find("._textaAreaBtn3").click(function(e){
				if($clue3Text.val().toLowerCase()=="sugar"){
					alert("you are right!");
					clue3Text.readOnly=true;
					
					app.parseSave(mysteryL1Obj,"clue3",$clue3Text.val());

				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL1Page.find("._textaAreaBtn4").click(function(e){
				if($clue4Text.val().toLowerCase()=="cream"){
					alert("you are right!");
					clue4Text.readOnly=true;
					
					app.parseSave(mysteryL1Obj,"clue4",$clue4Text.val());

				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL1Page.find("._textaAreaBtn5").click(function(e){
				if($clue5Text.val().toLowerCase()=="cocoa"){
					alert("you are right!");
					clue5Text.readOnly=true;
					
					app.parseSave(mysteryL1Obj,"clue5",$clue5Text.val());

				}else{
					alert("sorry that's not correct");
				}
			});

			$mysteryL1Page.find("._continueTo2").click(function(e){
				if(clue1Text.readOnly && clue2Text.readOnly && clue3Text.readOnly && clue4Text.readOnly && clue5Text.readOnly && $level1Answer.val().toLowerCase() == "hootsuite"){
					$mysteryL1Page.hide();
					//$mysteryL2Page.show();
					//app.mysteryL2Page();
					app.initializeML2();
				}else{
					alert("You must solve the clues on this level first");
				}
			});
			
			$mysteryL1Page.find("._homePage").click(function(e){
				$mysteryL1Page.hide();
				$gamePage.show();
				app.gamePage();
			});

			var query = new Parse.Query(mysteryL1Obj);
			query.equalTo("creator", Parse.User.current());

			var clue1, clue2, clue3, clue4, clue5;

			query.find({
				success:function(result) {
					if(debug == true){
						alert("find was successful, length: " + result.length);
					}
					clue1 = result[0].get('clue1');
					clue2 = result[0].get('clue2');
					clue3 = result[0].get('clue3');
					clue4 = result[0].get('clue4');
					clue5 = result[0].get('clue5');

					if(clue1 != "incomplete"){
						clue1Text.value=String(clue1);
						clue1Text.readOnly=true;
					}
					if(clue2 != "incomplete"){
						clue2Text.value=clue2;
						clue2Text.readOnly=true;
					}
					if(clue3 != "incomplete"){
						clue3Text.value=clue3;
						clue3Text.readOnly=true;
					}
					if(clue4 != "incomplete"){
						clue4Text.value=clue4;
						clue4Text.readOnly=true;
					}
					if(clue5 != "incomplete"){
						clue5Text.value=clue5;
						clue5Text.readOnly=true;
					}
				}
			}); 


		},
		
		

		parseSave: function(object,varName,varValue){
			var query = new Parse.Query(object);
			query.equalTo("creator", Parse.User.current());
			query.first({
				success:function(results) {
					if(results != "undefined"){
						if(debug == true){
							alert("found object");
						}
						results.set(varName,varValue);
						results.save();
					}else{
						if(debug == true){
							alert("Database obj could not be updated");
						}
					}
				},
				error:function(error) { 
				}
			});
		},

		mysteryLevel2: function(){
			var self = this,
			$mysteryL2Page = $("._mysteryL2Page"),
			$mysteryL3Page = $("._mysteryL3Page"),
			$gamePage = $("._gamePage"),
			$clue6Text = $("#clue6Text"),
			$clue7Text = $("#clue7Text"),
			$clue8Text = $("#clue8Text"),
			$clue9Text = $("#clue9Text"),
			$clue10Text = $("#clue10Text"),
			$level2Answer = $("#level2Answer");
			//$clue1TextArea= $("._clue1TextArea");

			$mysteryL2Page.show();

			if(debug == true)
				alert("entered this function");

			$mysteryL2Page.find("._checkInBtn6").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "liquor_store";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue6Text.value="Champagne";
							clue6Text.readOnly=true;
							app.parseSave(mysteryL2Obj, "clue6", "Champagne");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}
			});
			$mysteryL2Page.find("._checkInBtn7").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "store";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue7Text.value="Candles";
							clue7Text.readOnly=true;
							app.parseSave(mysteryL2Obj, "clue7", "Candles");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}

			});
			$mysteryL2Page.find("._checkInBtn8").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "store";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue8Text.value="Balloons";
							clue8Text.readOnly=true;
							app.parseSave(mysteryL2Obj, "clue8", "Balloons");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}

			});
			$mysteryL2Page.find("._checkInBtn9").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "shopping_mall";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue9Text.value="Present";
							clue9Text.readOnly=true;
							app.parseSave(mysteryL2Obj, "clue9", "Present");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}

			});
			$mysteryL2Page.find("._checkInBtn10").click(function(e){
				if(debug == true)
					alert("button pressed");
				
				var lat, long, checkIn;
				type = "bakery";

				navigator.geolocation.getCurrentPosition(onSuccess, onError);
				function onSuccess(position) {
					lat = position.coords.latitude;
					long = position.coords.longitude;
					if(debug == true)
						alert("geolocation call worked: "+lat+", "+long);
					var link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+long+"&radius=1000&types="+type+"&sensor=false&key=AIzaSyCI_9snF_gQSv5g7P39B5I9DNOJQYvyZpY";

					$.getJSON(link, function(data){
						if(data.results.length > 0){
							if(debug == true)
								alert("checkin worked!!: ");
							clue10Text.value="Cake";
							clue10Text.readOnly=true;
							app.parseSave(mysteryL2Obj, "clue10", "Cake");

						}else{
							alert("not close enough");
						}
					});
				}
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n');
				}
			});

			$mysteryL2Page.find("._textaAreaBtn6").click(function(e){
				if($clue6Text.val().toLowerCase()=="champagne"){
					alert("you are right!");
					clue6Text.readOnly=true;
					app.parseSave(mysteryL2Obj, "clue6", "Champagne");

				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL2Page.find("._textaAreaBtn7").click(function(e){
				if($clue7Text.val().toLowerCase()=="candles"){
					alert("you are right!");
					clue7Text.readOnly=true; 
					app.parseSave(mysteryL2Obj, "clue7", "Candles");

				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL2Page.find("._textaAreaBtn8").click(function(e){
				if($clue8Text.val().toLowerCase()=="balloons"){
					alert("you are right!");
					clue8Text.readOnly=true;
					app.parseSave(mysteryL2Obj, "clue8", "Balloons");

				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL2Page.find("._textaAreaBtn9").click(function(e){
				if($clue9Text.val().toLowerCase()=="present"){
					alert("you are right!");
					clue9Text.readOnly=true;
					app.parseSave(mysteryL2Obj, "clue9", "Present");
				}else{
					alert("sorry that's not correct");
				}
			});
			$mysteryL2Page.find("._textaAreaBtn10").click(function(e){
				if($clue10Text.val().toLowerCase()=="cake"){
					alert("you are right!");
					clue10Text.readOnly=true;
					app.parseSave(mysteryL2Obj, "clue10", "Cake");
				}else{
					alert("sorry that's not correct");
				}
			});


			$mysteryL2Page.find("._continueTo3").click(function(e){
				if(clue6Text.readOnly && clue7Text.readOnly && clue8Text.readOnly && clue9Text.readOnly && clue10Text.readOnly && $level2Answer.val().toLowerCase()=="birthday"){
					$mysteryL2Page.hide();
					$gamePage.show();
					app.gamePage();
					//$mysteryL3Page.show();
					//app.mysteryL2Page();
				}else{
					alert("You must solve the clues on this level first");
				}
			});
			
			$mysteryL2Page.find("._homePage").click(function(e){
				$mysteryL2Page.hide();
				$gamePage.show();
				app.gamePage();
			});

			var query = new Parse.Query(mysteryL2Obj);
			query.equalTo("creator", Parse.User.current());

			var clue6, clue7, clue8, clue9, clue10;

			query.find({
				success:function(result) {
					if(debug == true){
						alert("find was successful, length: " + result.length);
					}
					clue6 = result[0].get('clue6');
					clue7 = result[0].get('clue7');
					clue8 = result[0].get('clue8');
					clue9 = result[0].get('clue9');
					clue10 = result[0].get('clue10');

					if(clue6 != "incomplete"){
						clue6Text.value=String(clue6);
						clue6Text.readOnly=true;
					}
					if(clue7 != "incomplete"){
						clue7Text.value=clue7;
						clue7Text.readOnly=true;
					}
					if(clue8 != "incomplete"){
						clue8Text.value=clue8;
						clue8Text.readOnly=true;
					}
					if(clue9 != "incomplete"){
						clue9Text.value=clue9;
						clue9Text.readOnly=true;
					}
					if(clue10 != "incomplete"){
						clue10Text.value=clue10;
						clue10Text.readOnly=true;
					}
				}
			}); 

		},


};