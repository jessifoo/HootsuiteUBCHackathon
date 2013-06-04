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
var geo = {};
var app = {
    // Application Constructor
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

    	// set our device up with geo
    	app.initializeGeo();
    	
        // Init our parse SDK
        app.initializeParse();
        
        // test parse connectivity
        // app.testParse();
        
        // Query Parse for jounral entries
        app.getJournalEntries();
        
        // hook up our UI events
        app.initializeUI();
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
    initializeUI: function() {
    	var self= this,
    	$enrtiesPage = $("._entriesPage"),
    	$addEntryPage = $("._addEntryPage");
    	
    	$enrtiesPage.find("._addEntry").click(function(e) {
    		$enrtiesPage.hide();
    		$addEntryPage.show();
        });
        
    	$addEntryPage.find("._addEntry").click(function(e) {
        	var journalEntry = new JournalEntryObject(),
        	$title = $("#journalEntryTitle"),
        	$body = $("#journalEntryBody");
        	
        	journalEntry.set("title", $title.val());
        	journalEntry.set("body", $body.val());

        	if (journalEntry.get("title") == "") {
        		alert("Please enter a title for this journal entry.");
        		return;
        	}
        	
        	if (journalEntry.get("body") == "") {
        		alert("Please enter a body for this journal entry.");
        		return;
        	}

        	// Set our Geolocation if we have it
        	if (geo.isSet) {
        		console.log("Setting Geolocation");
        		journalEntry.set("position", new Parse.GeoPoint( { latitude: geo.latitute, longitude: geo.longitude } ));
        	} else {
        		console.log("no geo");
        	}
        	
        	journalEntry.save(null, {
    			success:function(object) {
    				console.log("Saved the object!");
    				$title.val("");
    				$body.val("");
    				
    				self.getJournalEntries();
    				
    				$addEntryPage.hide();
    				$enrtiesPage.show();
    			}, 
    			error:function(object,error) {
    				console.dir(error);
    				alert("Sorry, I couldn't save this journal entry.");
    			}
    		});
        });
        
    	$addEntryPage.find("._cancelEntry").click(function(e) {
        	$addEntryPage.hide();
        	$enrtiesPage.show();
        });
    	
    	$(document).on("click", "._mapLink", function(e) {
    		e.preventDefault();
    		e.stopPropagation();

    		//Get the position from the data attribute
    		var long = $(this).data("longitude"),
    		    lat = $(this).data("latitude");
    		
    		//Generate Google Static Map API link
    		var link = "http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+long+"&zoom=13&size=400x400&maptype=roadmap&markers=color:red%7Ccolor:red%7C"+lat+","+long+"&sensor=false";

    		// alert("Opening Map:" + link);
    		window.open(link, '_blank', 'location=yes');
    	});
    },
    formatTime: function(d) {
    	var curr_hour = d.getHours();

    	if (curr_hour < 12) {
    		a_p = "AM";
    	} else {
    	   a_p = "PM";
    	}
    	
    	if (curr_hour == 0) {
    	   curr_hour = 12;
    	}
    	
    	if (curr_hour > 12)
    	{
    	   curr_hour = curr_hour - 12;
    	}
    	
    	return curr_hour + ":" + d.getMinutes() + " " + a_p;
    },
    getJournalEntries: function() {
    	var query = new Parse.Query(JournalEntryObject);

    	query.find({
    		success:function(results) {
    			console.dir(results);
    			var s = "";
    			if (results.length > 0) {
	    			for(var i=0, len=results.length; i<len; i++) {
	    				var entry = results[i];
	    				s += "<li>";
	    				s += "<h2>"+entry.get("title")+"</h2>";

	    				var d = new Date(Date.parse(entry.createdAt));
	    				s += "<div class='meta'><div class='created'>" + d.toDateString() + " at " + app.formatTime(d) + "</div>";
	    				
	    				// Do we have geolocation info?
	    				if(entry.has("position")) {
	    					var pos = entry.get("position");
	    					s += "<a href=\"\" class=\"_mapLink location\" data-longitude=\"" + pos.longitude +"\" data-latitude=\""+ pos.latitude+"\">View on Map</a>";
	    				}
	    				
	    				s += "</div>";
	    				s += "<p>" + entry.get("body") + "</p>";
	    				s += "</li>";
	    			}
    			} else {
    				s = "<li class='loading'><h2>No journal entries found</h2></li>";
    			}
    			
    			$("._entries").html(s);
    		},
    		error:function(error) {
    			alert("Error when getting journal entries!");
    		}
    	});
    }
};