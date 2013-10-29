// canlendar.js
(function($) {

	// Plugin default settings
	var _settings = {
		"onDayClick": null
	};

	// Date bits
	var _year       = 2013;
	var _month      = 1;
	var _day        = 1;

	// Array of months       
	var _months = new Array(
		'一月孟春', '二月仲春', '三月季春', '四月孟夏', '五月仲夏', '六月季夏',
		'七月孟秋', '八月仲秋', '九月季秋', '十月孟冬', '十一月仲冬', '十二月季冬'
	);

	// Days in months
	var _daysinmonths = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	var _getDaysInMonth = function(month_no){
		if ((_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0){
			return 29;
		} else {
			return _daysinmonths[month_no - 1];
		}
	}
	var _getDaysSteps = function(day){
		if (day){
			var events = new Array();
			$.each(_events, function(i, evt){
				if (
					(evt.year == _year) &&
					(evt.month == _month) &&
					(evt.day == day)
				){
					events.push(evt);
				}
			});
			return events;
		}
	}

	// Stuff
	var _selected   = null , 
		_events     = null,
		viewdlg , editdlg ;

	// Methods
	var Calendar = function(element, options){
		this.$el = $(element)
		// Merge in options
		_settings = $.extend(_settings, options);
	};

	Calendar.prototype.init = function(){
		var $this = $(this),
			that = this;

		// Set default date
		var _startdate = _settings['start_date'];
		if (!_startdate){
			var d = new Date();
			_startdate = {
				"year"  : d.getFullYear(),
				"month" : d.getMonth() + 1, // +1 because month start at 0
				"day"   : d.getDay()
			}
		}
		_year   = (isNaN(_startdate.year) || _startdate.year == null) ? _year : _startdate.year;
		_month  = (isNaN(_startdate.month) || _startdate.month == null) ? _month : _startdate.month;
		_day    = (isNaN(_startdate.day) || _startdate.day == null) ? _day : _startdate.day;

		// Load event data
		if (_settings['events']){
			_events = options.events;
		}
		that.render();
		return this;
	};

	// View render function
	Calendar.prototype.render = function(){
		var $this = this.$el,
			that = this;

		// Hide/clear calendar
		$this.removeClass('in');
		$this.find('ul.thumbnails').remove();

		// Get the number of days in the month
		var _days_to_build = _getDaysInMonth(_month);

		// Build a thumbnail list per week
		var _rows = Math.ceil(_days_to_build / 7);
		var _counter = 1;
		for (var i = 0; i < _rows; i++){

			// Create the list
			var $ul = $('<ul/>').addClass('thumbnails').appendTo($this);

			// Build the days
			for (var j = 0; j < 7; j++){

				// Create thumbnail markup
				var $li = $('<li/>').addClass((i == 0 ? 'offset1 ' : '') + 'span2').appendTo($ul);
				var $a = $('<a/>', {
					"href": '#', "data-day": _counter
				}).addClass('thumbnail').appendTo($li);
				var $day = $('<span/>').addClass('day label label-info').html(_month + "月"+_counter+"日").appendTo($a);
				$("<i/>").addClass('icon-edit edit-control').appendTo($a);

				// Create events list
				var _evts = 0;
				if (_events){
					$.each(_events, function(i, evt){
						if (
							(evt.year == _year) &&
							(evt.month == _month) &&
							(evt.day == _counter)
						){
							$.each(evt.note, function(title, desc){
								$a.append($('<div/>').addClass('event').html(title+ ":" + desc));
								_evts++;	
							})
						}
					});
				}

				// Create an event counter for small screens
				if (_evts > 0){
					$a.append($('<span/>').addClass('counter badge badge-success').html('x ' + _evts));
				}

				// Onwards
				_counter++;
				if (_counter > _days_to_build){break;}
			}
			if (_counter > _days_to_build){break;}

		}

		// Add event handler
		$this.find('a.thumbnail').on('click', function(e){
			e.preventDefault();

			// Find the events for this day
			var day = $(this).attr('data-day'),
				steps = _getDaysSteps(day)
				time = {
					year : _year,
					month : _month,
					day : day
				};

			// Display the event details
			$this.trigger('dayclick', [e.target, steps, time]);
			return false;
		});

		// Show calendar
		$this.addClass('in');
	};

	// Set the date
	Calendar.prototype.setDate = function(year, month, day){
		var $this = $(this);

		// Set locals
		_year   = (isNaN(year) || year == null) ? _year : year;
		_month  = (isNaN(month) || month == null) ? _month : month;
		_day    = (isNaN(day) || day == null) ? _day : day;

		this.render();
	};

	Calendar.prototype.setNote = function(note){
		var updated = false;
		$.each(_events, function(idx, event){
			if(event.month === note.month && 
				event.day === note.day && event.year === note.year){
				$.extend(event, note);
				updated = true;
			}
		});
		if(!updated) _events.push(note);
		this.render();
	};

	Calendar.prototype.setNotes = function(notes){
		_events = notes;
		this.render();
	};

	jQuery.fn.bootCal = function(method) {
		var args = arguments;
		return this.each(function () {
			var $this = $(this)
        	, data = $this.data('calendar');

	      	if (method && data && data[method]){
				return data[method].apply(
					data, Array.prototype.slice.call(args, 1)
				);
			} else if (typeof method === 'object' || !method ) {
				if (!data) 
					$this.data('calendar', (data = new Calendar(this, args).init(args)));
			} else {
				$.error('Method ' +  method + ' does not exist on jQuery.bootCal' );
			}
    	});
	};
})(jQuery);


/**
 * jQuery plugin. Bootstrap month selector widget.
 *
 * @requires twitter.bootstrap
 * @author Barry Jones <barry@onalldevices.com>
 */
(function($) {

	// Plugin default settings
	var _settings = {
		'afterChange'   : null,
		'label'         : null
	};

	// Array of months       
	var _months = new Array(
		'一月孟春', '二月仲春', '三月季春', '四月孟夏', '五月仲夏', '六月季夏',
		'七月孟秋', '八月仲秋', '九月季秋', '十月孟冬', '十一月仲冬', '十二月季冬'
	);

	// Sub nodes
	var _list       = null;
	var _label      = null;
	var _selected   = null;

	// Methods
	var _methods = {
		init: function(options){
			var $self = this;
			return this.each(function(){

				var $this = $(this);

				// Merge in options
				_settings = $.extend(_settings, options);

				// Grab node references
				if (_settings.label){_label = _settings.label;}
				if ($this.find('ul')){
					_list = $this.find('ul:eq(0)');
				}

				// Create month list items
				for (var i = 0; i < _months.length; i++){
					_list.append($('<li/>').append(
						$('<a/>', {"href": '#', "data-idx": i})
							.html(_months[i])
					));
				}
				_selected = _settings.selected;

				// Set default
				$this.monthSelector('updateLabel');
				_list.find('li').eq(_selected - 1).addClass('active');

				// Attach change handler afterChange
				_list.find('> li > a').on('click', function(e){
					e.preventDefault();
					var $node = $(this);

					// Update our month
					_selected = parseInt($node.attr('data-idx')) + 1;

					$this.monthSelector('selectMonth', _selected);
					$this.removeClass('open');

					return false;
				});

			});
		},
		getMonth: function() {
			return {
				"number"    : _selected,
				"label"     : _months[_selected - 1]
			}
		},

		selectMonth: function(month) {
			var $this = $(this);

			_selected = month;
			$this.monthSelector('updateLabel');
			_list.find('> li').removeClass('active');
			
			// Close list
			$this.removeClass('open');

			// Fire after change event
			if (_settings['afterChange']){
				_settings.afterChange.call(this
					, $this.monthSelector('getMonth'));
			}
		},

		updateLabel: function(){
			_label.html(_months[_selected - 1]);
		}
		
	};

	jQuery.fn.monthSelector = function(method) {

		// Run method?
		if (method && _methods[method]){
			return _methods[ method ].apply(
				this,
				Array.prototype.slice.call(arguments, 1)
			);
		} else if (typeof method === 'object' || !method ) {
			return _methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.monthSelector' );
		}

	};
})(jQuery);