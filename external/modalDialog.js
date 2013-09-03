"use strict";

// Presents a modal dialog to the user
// Clicking anywhere outside the dialog will call the 'cancelled' callback

// TODO: cancel on ESC

(function () {
	var background,
		stack = [];

	var cancel = function (event) {
		if (stack.length === 0) {
			console.error("calling modalDialog.cancel() with null element");
			return;
		}

		var dialog = stack.pop();
		if (dialog.options.cancelCallback) {
			dialog.options.cancelCallback();
		}
		if (dialog.options.center) {
			dialog.element.remove();
		} else {
			dialog.element.hide();
		}

		if (stack.length === 0) {
			$('body').removeClass('modalNoOverflow');
			background.hide();
		} else {
			_.last(stack).element.show();
		}

		if (event) {
			event.stopPropagation();
		}
	};

	var backgroundClickHandler = function (event) {
		var dialog = _.last(stack);

		if (event.target !== background[0]) {
			return;
		}

		if (dialog.options.clickToCancel) {
			cancel(event);
		}
	};

	var show = function (_element, _options) {
		var dialog = {
			options: _.defaults(_options || {}, {
				clickToCancel: true,
				closeButton: true,
				center: true
			}),
			element: $(_element)
				.css({
					'z-index': 25
				})
		};

		background = $('#modalBackground');
		if (!background || background.length === 0) {
			background = $('<div id=modalBackground/>').css({
				position: "fixed",
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				width: "100%",
				height: "100%",
				'background-color': 'rgba(0, 0, 0, 0.5)',
				'z-index': 20,
				display: 'none',
				'overflow-x': 'none',
				'overflow-y': 'auto'
			});
			background.click(backgroundClickHandler);
			$('body').append(background);
		}

		if (stack.length > 0) {
			_.last(stack).element.hide();
		}
		stack.push(dialog);

		dialog.element.click(function (event) {
			if ($(event.target).is('a[href]')) {
				cancel();
			} else {
				event.stopPropagation();
			}
		});
		
		if (dialog.options.closeButton === true) {
			var closeButton = dialog.element.find('.closeDialogButton');
			
			if (closeButton.length === 0) {
				closeButton = $('<div class=closeDialogButton>&nbsp;x&nbsp;</div>')
					.css({
						position: "absolute",
						top: "0px",
						right: "6px"
					})
					.click(cancel);
			}
			dialog.element.append(closeButton);
		}

		if (dialog.options.center) {
			$('body').addClass('modalNoOverflow');
			background.append(dialog.element);
		}
		
		dialog.element.css('opacity', 0);
		dialog.element.show();
		background.show();

		setTimeout(function () {
			if (dialog.options.center) {
				var offset = ($(window).height() - dialog.element.outerHeight()) / 2;
				dialog.element.css('top', Math.max(10, offset) + "px");
			}
			dialog.element.css('opacity', 1);

		}, 1);
	};

	window.modalDialog = {
		show: show,
		cancel: cancel
	};
})();

