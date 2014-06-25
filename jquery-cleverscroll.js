/**
 *  A clever plugin that checks for element visiblity as you scroll
 *  It tidies up after itself and doesn't mind if you can't make your mind up
 */

;(function(){

	var clever = [],
		count = 0;

	var isElementInViewport = function(el, offset){

		//special bonus for those using jQuery
		if( el instanceof jQuery ){
			el = el[0];
		}

		// Get the bounding rectangle - this only works really well in newer browsers
		var rect = el.getBoundingClientRect();

		var difference = rect.height > site.height ? rect.height - site.height : 0;

		// We're not checking left/right
		return (
			( rect.top + offset >= 0 && rect.top + offset <= site.height + difference ) ||
			( rect.bottom + offset <= site.height + difference && rect.bottom + offset >= 0 )
		);

	};

	$.fn.cleverScroll = function(settings){

		// Attempt to get a stored ID
		// This is so that we can remove and apply the plugin without issues - e.g. at different browser sizes
		var id = $(this).data('cleverid');

		// If we're removing the plugin, leave it a spot in the clever array just in case we re-apply
		if( settings == 'remove' ){

			clever[id] = false;

		// Otherwise, proceeed as normal
		}else{

			var defaults = {
				ready: function(){},
				onEnterViewport: function(){},
				onLeaveViewport: function(){},
				offset: 0,
				useOnce: true
			};

			var options = $.extend(defaults, settings);

			// If there wasn't already an id, use the count so that each one is unique
			var newId = id ? id : count;

			// Create the instance
			clever[newId] = {
				options: options,
				elements: []
			};

			// Store the elements
			this.each(function(i){

				clever[newId].elements[i] = {
					el: this,
					visible: false,
					enteredViewport: false,
					leftViewport: false
				};

				// Function for readiness
				options.ready($(this), i);

			});

			// If we didn't have an id from the element data, add it now and incriment the count
			if( !id ){

				$(this).data('cleverid', count);
				count++;

			}

		}

		return this;

	};

	$(window)
		.on('DOMContentLoaded load resize scroll', function(){

			// Loop through each instance of the clever array
			for( var i = clever.length - 1; i >= 0; i-- ){

				// Ignore removed instances
				if( clever[i] !== false ){

					// Store the instance
					var instance = clever[i];

					// For each element in the instance
					for( var j = clever[i].elements.length - 1; j >= 0; j-- ){

						// Store the element
						var element = instance.elements[j];

						// Ignore any bad elements
						if( element.el === false ) return false;

						// Check for visiblilty
						var visible = isElementInViewport( element.el, instance.options.offset );

						// If the element is visible, but still marked as hidden
						if( !element.visible && visible ){

							// Mark as visible
							element.visible = true;

							// Function for entering viewport
							instance.options.onEnterViewport($(element.el), j);

							// If this instance only requires one use of each element make a note of it entering the viewport
							if( instance.options.useOnce )
								element.enteredViewport = true;

						// If the element is hidden, but still marked as visible
						}else if( element.visible && !visible ){

							// Mark as hidden
							element.visible = false;

							// Function for leaving viewport
							instance.options.onLeaveViewport($(element.el), j);

							// If this instance only requires one use of each element, make a note of it leaving the viewport
							if( instance.options.useOnce )
								element.leftViewport = true;

						// If the element has entered and left the viewport and this has been stored
						}else if( element.leftViewport && element.enteredViewport ){

							// Remove it from the instance
							instance.elements.splice(j, 1);

							// If we're done with all elements in this instance, remove it entirely
							if( !instance.elements.length )
								clever.splice(i, 1);

						}

					};

				}

			};

		});

}());