"use strict";

// Dependencies:
// - jQuery
// - underscore

(function () {
	var readlang = {};
	
	// Authorization access token
	// --------------------------

	var accessToken = localStorage.getItem('readlang.access_token');

	// Read the access token if present in the window hash,
	// and write it to localStorage so it's not quite so visible
	var tokenMatch = /token=(.*)/.exec(window.location.hash);
	if (tokenMatch) {
		accessToken = decodeURIComponent(tokenMatch[1]);
		localStorage.setItem('readlang.access_token', accessToken);
		window.location.hash = "";
	}

	// Redirects to auth page without warning
	var requestAuth = function () {
		window.location.href = baseURL + '/oauth?response_type=token&client_id=a12345' +
			'&redirect_uri=' + encodeURIComponent(window.location.href) + '&scope=words';
	};

	// AJAX requests
	// -------------

	readlang.request = function (options) {
		if (!accessToken) {
			requestAuth();
			return;
		}

		options.headers = options.headers || {};
		options.headers["Authorization"] = "Bearer " + accessToken;

		if (options.path) {
			options.url = baseURL + options.path;
		}

		_.defaults(options, {
			dataType: "json",
			crossDomain: true
		});

		var errorCallback = options.error;

		options.error = function (jqXHR, textStatus, errorThrown) {
			console.log("Error ", jqXHR);

			if (jqXHR.status === 401) {
				requestAuth();
				return;
			}

			if (errorCallback) {
				errorCallback(jqXHR, textStatus, errorThrown);
			}
		};

		$.ajax(options);
	};

	// General user
	// ------------

	readlang.user = function (callback) {
		readlang.request({
			type: "GET",
			path: "/api/user",
			success: function (data, textStatus, jsXHR) {
				callback(data);
			}
		});
	};

	readlang.setLanguage = function (language, callback) {
		readlang.request({
			type: "PATCH",
			path: "/api/user",
			success: function (data) {
				callback(data);
			}
		});
	};

	readlang.logout = function (callback) {
		localStorage.removeItem('readlang.access_token');
		readlang.request({
			type: "POST",
			path: "/api/logout",
			success: function (data, textStatus, jsXHR) {
				callback();
			}
		});
	};

	// Words for testing
	// -----------------

	readlang.fetchWords = function (amount, callback) {
		readlang.request({
			type: "GET",
			path: "/api/userWords?contexts=true&wordGroup=readyToTest&limit=" + amount,
			success: function (data) {
				callback(data);
			}
		});
	};

	readlang.recallWord = function (id, ease, strength /* optional, default = 1 */, callback /* optional */) {
		readlang.request({
			type: "POST",
			path: "/api/userWord/" + id + "/recall",
			data: {
				recallEase: ease,
				strength: strength || 1
			},
			success: function () {
				callback();
			}
		});
	};

	window.readlang = readlang;
})();

