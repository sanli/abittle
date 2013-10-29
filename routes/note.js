
/*
 * GET users listing.
 */
var db = require('../data/moongose.js')
	, getParam = require('../sharepage').getParam
	, rt = require('../sharepage').rt
	, srt = require('../sharepage').srt
	, assert = require('../sharepage').assert
	, inspect = require('util').inspect;


//列表参数
var ARG = {
	month : {name:'month', key:'month', optional: true},
	uid : {name:'uid', key:'uid', optional: true},
	search: { name: 'search', key: 'search', optional: true },
	//增加或者更新Node信息
	year : {name:'year', key:'year', optional: true},
	month : {name:'month', key:'month', optional: true},
	day : {name:'day', key:'day', optional: true},
	note : {name:'note', key:'note', optional: true},
	//NoteID
	id : {name:'id', key:'id', optional: false},
}

//查询记录
exports.list = function(req, res){
	var arg = getParam("import cell file", req, res, [ ARG.uid,  ARG.year, ARG.month, ARG.day ]);
	if(!arg.passed)
		return;

  	db.listNote({
  		uid: arg.uid, 
  		year: arg.year, 
  		month: arg.month
  	}, function(err, notes){
  		rt(true, {notes: notes}, res);
  	});
};

exports.updateNote = function(req, res){
	var arg = getParam("updateNote", req, res, [ARG.uid, ARG.note, ARG.year, ARG.month, ARG.day]);
	if(!arg.passed)
		return;

  	db.updateNote(arg.uid, arg.year, arg.month, arg.day, arg.note, srt(res));
};