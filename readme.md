# Readlang Words API (alpha version)

The API allows you to create web-based apps and games using the words from a user's Readlang account.

__The API is currently an early alpha release, so expect changes, and please let me know if anything doesn't work.__

## Contents of this repo

These are the important bits:

- __readme.md__ - this file, explaining how to use the API.

- __index.html__ - HTML for the _Fill in the Blanks!_ example game.

- __src/app.js__ - the main javascript code for _Fill in the Blanks!_

- __src/readlang.js__ - a small library to make the API calls handling authentication - __use this in your projects__.

## API key

You can use the included API key to test your application from __http://localhost:4000__.

To deploy to a different domain you'll need a new API key, please email me at steveridout@gmail.com and I'll happily create one for you.

## Using the API from your webpage

I recommend using readlang.js to make all API calls, that way you don't need to worry about the OAuth 2.0 authentication.

Note that readlang.js has dependencies on __jQuery__ and __underscore.js__.

If you get stuck, try forking the this repo containing the _Fill in the Blanks!_ game and working from that. Failing that, please email me or post a new github issue.

## API methods

The responses may include more data than described here, I've only included the relevant information for using the Words API.

### GET /api/user

#### Example response

	{
		"username": "steve",
		"firstLanguage": "en",
		"currentLearningLanguage": "es"
	}

### PATCH /api/user

#### Example request

Change the user's learning language to French:

	{
		"currentLearningLanguage": "fr"
	}

#### Example response

	{
		"success": "true"
	}

After receiving this, all other interaction with the API will return French words.

### GET /api/userLanguages

#### Example response

A list of languages, each including its language code, its original name and its English name.

	[
		{
			"code":"bg", "english":"Bulgarian", "name":"български"
		},
		{
			"code":"ca", "english":"Catalan", "name":"Català"
		},
		{
			"code":"es", "english":"Spanish", "name":"Español"
		},
		{
			"code":"fr", "english":"French", "name":"Français"
		}
	]

### GET /api/userWordCounts

Returns the count of the user's words for the given language.

#### Query parameters

- __language__ - the 2-letter language code (defaults to the currently selected language)

#### Example Request

	GET https://readlang.com/api/userWordCounts?language=fr

#### Example Response

	{
		"total":2825,
		"notStarted":1713,
		"justStarted":112,
		"gettingThere":166,
		"mastered":834,
		"scheduled":531
	}

### GET /api/userWords

#### Query parameters

- __language__ - the 2-letter language code (defaults to the currently selected langauge)
- __wordGroup__ - one of:
	- __readyToTest__ - this is probably the one you want if you're creating a game
	- notStarted
	- justStarted
	- gettingThere
	- mastered
	- scheduled
	- reviewedSince (requires extra __timestamp__ parameter)
- __timestamp__ - return all words after this timestamp (for use with __wordGroup=reviewedSince__)
- __limit__ - the maximum number of words to return
- __contexts__ - include the word contexts (__true__ or __false__ (default))

#### Example Request

	GET https://readlang.com/api/userWords?language=es&wordGroup=readyToTest&limit=2&contexts=true

#### Example Response
	[
		{
			"_id" : "51658d594ee93cac670da5c9",
			"contexts" : [
				{
					"_id" : "51f8e8cbefa40ff41e000020",
					"text" : "Arreglar el coche fue un reto"
				}
			],
			"easinessFactor" : 2.3800000000000003,
			"favorite" : true,
			"frequency" : 935,
			"interval" : 518400000,
			"language" : "es",
			"lastRecallEase" : 5,
			"nextDate" : "2013-08-18T02:00:00.000Z",
			"previousInterval" : 86400000,
			"previousIntervalDate" : "2013-08-12T02:00:00.000Z",
			"recallAttempts" : 6,
			"translation" : "challenge",
			"word" : "reto"
		},
		{
			"_id": "51f8d8e2c480eba4f7afde8b",
			"contexts": [
			{
				"_id": "51f8d8e2e4e437041f00001c",
				"bookID": "518ebb00f656c9074c0006db",
				"text": "Sobre la cama de Alicia había un camisón de tela blanca, de mangas cortas, sin lazos ni botones."
			}],
			"easinessFactor": 2.6000000000000001,
			"favorite": true,
			"frequency": 305,
			"interval": 1347840000,
			"language": "es",
			"lastRecallEase": 5,
			"nextDate": "2013-08-25T16:24:00.000Z",
			"previousInterval": 518400000,
			"previousIntervalDate": "2013-08-10T02:00:00.000Z",
			"recallAttempts": 7,
			"translation": "nightgown",
			"word": "camisón"
		}
	]

There is a lot of information associated with each word. The most important fields are:

- word
- translation
- contexts

### GET /api/userWord/:\_id

This will return the userWord with the given _id.

#### Example Request

	GET /api/userWord/51f8d8e2c480eba4f7afde8b

#### Example Response

	{
		"_id": "51f8d8e2c480eba4f7afde8b",
		"deleted": false,
		"easinessFactor": 2.6,
		"frequency": 305,
		"interval": 1347840000,
		"language": "es",
		"lastRecallEase": 5,
		"nextDate": "2013-08-25T16:24:00.000Z",
		"phrase": false,
		"previousInterval": 518400000,
		"previousIntervalDate": "2013-08-10T02:00:00.000Z",
		"recallAttempts": 7,
		"translation": "nightgown",
		"userID": "50cb58dbf939c7397b000002",
		"word": "camisón",
		"favorite": true,
		"contexts":
			[
				{
					"text": "Sobre la cama de Alicia había un camisón de tela blanca, de mangas cortas, sin lazos ni botones.",
					"bookID": "518ebb00f656c9074c0006db",
					"_id": "51f8d8e2e4e437041f00001c"
				}
			]
	}

### PATCH /api/userWord/:\_id

This will edit the userWord with the given _id.

#### Example Request

	PATCH /api/userWord/51f8d8e2c480eba4f7afde8b

#### Example Request Body

	{
		"translation": "nightgown / long t-shirt"
	}

### DELETE /api/userWord/:\_id

This will remove the userWord with the given _id.

#### Example Request

	DELETE /api/userWord/51f8d8e2c480eba4f7afde8b

### POST /api/userWord

This will add a new word to the user's word list.

#### Example Request Body

	{
		"language": "es",
		"word": "manzana",
		"translation": "apple",
		"contexts": [
			{
				"text": "Me gusta este manzana"
			}
		]
	}

#### Example Response Body

	{
		"success": "true"
	}

### POST /api/userWord/:_id/recall

Report how easy the user recalled the word.

#### Example Request
	
	POST https://readlang.com/api/userWord/51f8d8e2c480eba4f7afde8b/recall

#### Arguments

- __recallEase__ - A numeric value from 0 to 5:
	- __0__ - Didn't remember at all
	- __2__ - Almost remembered
	- __3__ - Just remembered
	- __5__ - Remembered perfectly
- __strength__ - A numeric value from 0 to 1 which indicates how reliable this report is. e.g.
	- __0__ - Pointless - don't use 0, it won't make any difference!
	- __0.3__ - Weak test, e.g. a very easy multiple choice test
	- __0.5__ - Medium, e.g. a more tricky multiple choice test
	- __1__ - Strong test, user must know the word cold with no hint apart from the context sentence

#### Example Request Body

	{
		"recallEase": 4,
		"strength": 0.5
	}

### POST /api/logout

Self explanatory.

