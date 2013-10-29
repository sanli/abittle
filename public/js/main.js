var PG = new $P({
	default :{
		month : new Date().getMonth() + 1,
		uid: "xiaopangzi"
	},
	bind: function(){
		this.bindhash();
	}
});

var CAL = $.extend(new $M(), {

	bind : function(){
		$(PG).on('statechange', $.switchcontext(this, this.load));
	},

	load : function (){
		var month = PG.state.month;
		if(month){
			bootcal.monthselector.monthSelector("selectMonth", month);
			bootcal.calendar && bootcal.calendar.bootCal('setDate', 2013, month, 1);
		}
		// Load dialog view
		$.get('views/dialog-events.html', function(markup){
			// Prepare the dialog
			
			$('body').append($(markup));
			CAL.viewdlg = $("#viewdlg"),
			CAL.editdlg = $("#editdlg");
		});
	},


	//编辑日记录
	editNote : function(note, time){
		var noteform = CAL.editdlg.find('#noteform');
		var today = note[0];
		if(today){
			noteform.clearall().autofill(today.note);
		}else{
			noteform.clearall();
		}
			
		$this = $(this);
		$.showmodal(CAL.editdlg, function(noteform){
			return CAL.saveNote(noteform, time);
		});
	},

	// 预览日记录
	showNote : function(events){
		var $this = $(this);
		var $view = tmpl('viewtmpl', { evt : events[0] });
		var $body = CAL.viewdlg.find('.modal-body');
		$body.html('').append($view);
		CAL.viewdlg.modal('show');
	},

	saveNote: function( noteform, time ){
		$form = $(noteform);
		var note = $form.getdata(),
			v = $.extend({ uid: PG.state.uid }, time , {
				note : note	
			});
		$M.doupdate('/note/u', v, function(res){
		 	bootcal.calobj.setNote(v);
		});
		return true;
		// bootcal.calobj.setNote(v);
		// return true;
	}
});

/**
 * Application namespace
 */
window.bootcal = {};
(function(ns) {
	ns.monthselector    = null;
	ns.calendar         = null;
	ns.progress         = 0;
	ns.progressbar      = null;
})(bootcal);

function initCal(){
	// Show progress bar
	bootcal.progressbar = $('#bc-progress').show();
	bootcal.progressbar.addClass('in')
		.find('.indicator').html('正在读取数据..')
		.next().find('.bar').css({"width": bootcal.progress + '%'});

	var _progress_timer = setInterval(function(){
		bootcal.progress += 10;
		if (bootcal.progress >= 100){bootcal.progress = 0;}
		bootcal.progressbar.find('.bar').css({"width": bootcal.progress + '%'});
	}, 50);

	// Initialise the month selector plugin
	bootcal.monthselector = $('#bc-month-selector').monthSelector({
		"afterChange": function(month){
			PG.pushState({month: month.number, year: 2013, day:1})
		},
		"label"     : $('#bc-month-selector .monthlabel'),
		"selected" : new Date().getMonth() + 1
	}).addClass('in');

	// Hide the progress bar
	clearInterval(_progress_timer); _progress_timer = null;
	bootcal.progress = 100;
	bootcal.progressbar.find('.bar').css({"width": bootcal.progress + '%'});
	setTimeout(function(){bootcal.progressbar.removeClass('in').hide();}, 800);	


	// Initialise the calender plugin

	bootcal.calendar = $('#bc-calendar-widget').bootCal({}).addClass('in');
	bootcal.calobj = bootcal.calendar.data('calendar');

	bootcal.calendar.on('dayclick',function(event, clicked, step, time){
		$clicked = $(clicked);
		if($clicked.hasClass('edit-control')){
			CAL.editNote(step, time);
		}else{
			CAL.showNote(step, time);
		}
	});
	bootcal.calendar.bootCal('setDate', 2013, PG.state.month, 1);

	// Retrieve the events data-idx
	$.get('/note/l', { 
		uid: PG.state.uid ,
		year : 2013, 
		month: PG.state.month 
	} , function(data){
		if(data.R = 'Y'){
			bootcal.calendar.bootCal('setNotes', data.M.notes);	
		}else{
			$.alert('body', "查询出错：" + data.M);
		}
	});
}

function init(){
	initCal();
	CAL.bind();
	PG.bind();
	$(window).trigger('hashchange');
};

$(document).ready(init);