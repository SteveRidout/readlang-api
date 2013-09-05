"use strict";

$(document).ready(function () {
	readlang.setup({
		baseURL: "https://readlang.com",
		APIKey: "a12345"
	});

	var logout = function () {
		readlang.logout(function () {
			window.location.reload();
		});
	};

	var user,
		languageSelector;

	readlang.user(function (data) {
		user = data;

		$('#user').text("Username: " + user.username).append(' <button id="logout">logout</button>');
		$('#logout').click(logout);
		var startGameButton = $('<button>Start Game!</button>').click(function () {
			var selectedLanguageName = languageSelector.find('option:selected').text();
			modalDialog.cancel();

			startGameButton.remove();

			readlang.fetchWords(totalWords, function (data) {
				userWords = data;

				if (userWords.length === 0) {
					alert('No words left to test in ' + selectedLanguageName +
						' right now, go to readlang.com and translate some more words.');
				}

				_.each(userWords, function (userWord) {
					console.log("got userword", userWord._id);

					if (userWord.contexts && userWord.contexts.length > 0) {
						userWord.context = //'<span class="word">' +
							userWord.contexts[0].text
							.replace(new RegExp(userWord.word, 'i'),
								'<span class="blank">' + userWord.translation + '</span>');

						console.log("context: ", userWord.context);
					} else {
						userWord.context = '<span class="blank">' + userWord.translation + '</span>';
					}
				});

				for (var i = 0; i < wordsLimit; i++) {
					addWord();
				};

				addEmptyContexts();
				setTimeout(function () {
					newEvent();
				}, 1000);
			});
		});

		readlang.request({
			path: "/api/userLanguages",
			success: function (userLanguages) {
				languageSelector = $('<select/>');
				_.each(userLanguages, function (language) {
					languageSelector.append('<option data-lang="' + language.code + '" title="' + language.english +
						'">' + language.name + '</options>');
				});

				modalDialog.show($('<div class="centralDialog"/>')
					.append('<h3>Select Language</h3>')
					.append(languageSelector)
					.append('<br/>')
					.append(startGameButton), {
						closeButton: false,
						clickToCancel: false
					});

				languageSelector
					.find('option[data-lang="' + user.currentLearningLanguage + '"]')[0].selected = true;

				languageSelector.change(function () {
					var selectedLanguage = languageSelector.find('option:selected').attr('data-lang');

					startGameButton.attr('disabled', 'disabled');
					readlang.request({
						type: 'PATCH',
						path: '/api/user',
						data: {
							currentLearningLanguage: selectedLanguage
						},
						success: function () {
							startGameButton.removeAttr('disabled');
						}
					});
				});
			}
		});
	});

	var wordsLimit = 6,
		totalWords = 40,
		initialDelay = 3500,
		delaySpeedup = 0.95,
		currentWords = [],
		currentNotDisplayedWords = [],
		userWords,
		playedWords = [],
		timer,
		score = 0,
		gameFinished = false;

	var addWord = function () {
		console.log("adding word");
		if (gameFinished) {
			console.log("end game");
			return;
		}

		var userWord = userWords.pop();
		if (!userWord) {
			return;
		}
		console.log("add userWord: ", userWord._id);
		currentWords.push(userWord);
		currentNotDisplayedWords.push(userWord);

		var wordElement = $('<li class="word draggable"/>')
			.attr('data-id', userWord._id)
			.text(userWord.word).draggable({
				stop: function () {
					wordElement.css({
						left: 0,
						top: 0
					});
				}
			})
		$('#words').append(wordElement).append(' ');
	};

	$('#score').text(score);

	var addEmptyContexts = function () {
		if (gameFinished) {
			return;
		}
		var contexts = $('#contexts');

		while (contexts.find('li').length < wordsLimit) {
			contexts.append('<li class="empty"></li>');
		}

		while (contexts.find('li').length > wordsLimit) {
			contexts.find('li.empty').eq(0).remove();
		}
	};

	var endGame = function (message) {
		clearTimeout(timer);

		var endDialog = $('<div class="centralDialog"/>')
			.html('<p>' + message + '</p><p>Your final score is ' + score + '</p>')
			.append($('<button>Play again</button>').click(function () {
				window.location.reload();
			}))
			.append($('<button>Logout</button>').click(logout));

		modalDialog.show(endDialog, {
			closeButton: false,
			clickToCancel: false
		});
	};

	var startEndGame = function () {
		console.log("STARTING END GAME");
		var countdownElement = $('#countdown');
		var countdown = 20;

		var countdownTick = function () {
			countdownElement.text('End game countdown: ' + countdown);
			countdown--;

			if (countdown < 0) {
				endGame("Out of time");
				$('#contexts .context').each(function () {
					var $this = $(this),
						id = $this.attr('data-id');

					var userWord = _.find(playedWords, function (userWord) {
						return id === userWord._id;
					});

					$this.html(userWord.context.replace(
						/<span class="blank">[^<]*<\/span>/i, '<span class="word">' + 
						userWord.word + '</span>'));

					$('#words li').remove();
				});
			} else {
				timer = setTimeout(countdownTick, 1000);
			}
		};

		countdownTick();
	
		gameFinished = true;
	};

	var addContext = function () {
		var userWord = currentNotDisplayedWords.splice(
				_.random(currentNotDisplayedWords.length - 1), 1)[0];

		playedWords.push(userWord);

		var contextElement = $('<li class="context"/>')
			.attr('data-id', userWord._id)
			.html(userWord.context)
			.droppable({
				accept: ".draggable",
				activeClass: "dropActive",
				hoverClass: "dropHover",
				drop: function (event, ui) {
					var draggable = $(ui.draggable);
					console.log("%s : %s", draggable.attr('data-id'), userWord._id);

					if (draggable.attr('data-id') === userWord._id) {
						score++;
						console.log("add score");
						readlang.recallWord(userWord._id, 4, 0.5, function () {
								console.log("remembered success");
							});
						addWord();
						contextElement.addClass('success');
						timer = setTimeout(function () {
							contextElement.remove();
							addEmptyContexts();
						}, 700);
						draggable.remove();
						if ($('#words li').length === 0) {
							endGame('Well done!');
						}
					} else {
						score--;
						console.log("down score");
						readlang.recallWord(userWord._id, 2, 0.2, function () {
								console.log("remembered fail");
							});
						readlang.recallWord(draggable.attr('data-id'), 2, 0.2, function () {
								console.log("remembered fail");
							});
						contextElement.html(userWord.context);
						draggable.css({
							left: 0,
							top: 0,
							visibility: 'visible'
						});
					}
					$('#score').text(score);
				},
				over: function (event, ui) {
					var draggable = $(ui.draggable).css('visibility', 'hidden');

					contextElement.html(userWord.context.replace(
						/<span class="blank">[^<]*<\/span>/i, '<span class="word">' + 
						draggable.text() + '</span>'));
				},
				out: function (event, ui) {
					var draggable = $(ui.draggable).css('visibility', 'visible');
					contextElement.html(userWord.context);
				}
			});
		var lastContext = $('#contexts .context').last();
		if (lastContext.length > 0) {
			lastContext.after(contextElement);
		} else {
			$('#contexts').prepend(contextElement);
		}

		addEmptyContexts();

		if (currentNotDisplayedWords.length === 0) {
			startEndGame();
			return false;
		}

		return true;
	};

	var delay = initialDelay;
	var newEvent = function () {
		if (addContext()) {
			delay *= delaySpeedup;
			timer = setTimeout(newEvent, delay);
		} else {
			console.log('No more new words');
		}
	};
});
