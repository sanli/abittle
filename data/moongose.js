//moongose.js
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  debug = require('util').debug,
  inspect = require('util').inspect;


var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/abittle',{
  db: { native_parser: true, safe:true },
});
var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, '访问数据库出错:'));
mdb.once('open', function callback (err) {
	console.log("mongoose连接DB成功...");
});

var daily_note = new Schema({
	uid: String,
	month: Number,
    day: Number,
    year: Number,
	note: [{ 
		item : String,
		value : String
	}],
	notetime: Date,
},  { collection: 'daily_note' });
daily_note.index({uid: 1, year: 1, month : 1, day: 1});
var DailyNote = mongoose.model('daily_node', daily_note);
exports.DailyNode = DailyNote;

function wrapNote (note) {
	var res = [];
	for(item in note){
		if(typeof note[item] === 'string')
			res.push({
				item: item,
				value: note[item]
			})
	}
	return res;
}

function unwrapNote(noteitem){
	var note = {};
	if(noteitem.note){
		noteitem.note.forEach(function(li){
			var name = li.item, v = li.value;
			note[name] = v;
		})
	}
	var result = noteitem.toObject();
	result.note = note;
	return result;
}

exports.updateNote = function(uid, year, month, day, note, fn){
	var noteitem ={
		uid: uid , 
		year: year,
		month: month, 
		day: day, 
		notetime : new Date(),
		note : wrapNote(note),
	}

	DailyNote.update({ uid: uid , month: month
					, day: day, year: year }
		, { $set : noteitem }
		, { upsert : true }
		,fn);
}


exports.listNote = function(cond, fn){
	DailyNote.find(cond, function(err, notes){
		if(err){
			console.trace("list note error:" + err.message);
			fn(err, notes);
		}
		var results = [];
		notes.forEach(function (note) {
			results.push(unwrapNote(note));
		})
		fn(err, results);
	});
}