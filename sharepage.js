/*
 * sharepage.js
 */

exports.PAGE = {
	pageStart : {name:'pageStart', key:'s', optional: true},
	pageLength : {name:'pageLength', key:'l', optional: true},
	searchKey : {name:'searchKey', key:'k', optional: true}
}

/**
 * 读取页面参数，做简单验证
 * @params : [{ name:'serviceName', key:'S', optional: true}]
 */
var getreq = function(msg, req, res, params){
	var arg = {
		setPassed : function(passed){
			this.passed = passed;
			return this;
		}
	};

	var fun = function(param){
		console.log(msg + " : " + param.key + "=" + req.param(param.key));

		if(!param.optional && !req.param(param.key)){
			throw new Error('need param:'+ param.key +' in request');
		}
		arg[param.name] = req.param(param.key);		
	};

	if(Array.isArray(params))
		params.forEach(fun);		
	else
		fun(params);

	return arg;
}
exports.getreq = getreq;

//验证并读取查询条件
var getParam = function(msg, req, res, params){
	try{
		var arg = getreq(msg, req, res, params);
		return arg.setPassed(true);
	}catch(err){
		console.log("getreq err:" + err.message);
		rt(false, "getreq err:" + err.message, res);
		return { passed: false};
	}
}
exports.getParam = getParam;

//输入JSON返回结果到前端
var rt = function(ok, message, res){
	if(ok){
		var rtype = {R:'Y'};
	}else{
		var rtype = {R:'N'};
	}
	if(message) rtype.M = message ;
	res.json(rtype);
	return rtype;
};
exports.rt = rt;

exports.isme = function(){
	return process.argv[1].indexOf('service.js') > 0 ;
}

//根据执行状态，返回结果到前端
resultByState = function(res, fn){
	return function(err, docs){
		if(err){
			console.trace(err);
			return rt(false, err.message, res);
		}
		
		rt(true, fn == undefined ? {docs: docs} : fn(err, docs), res);
	}
}
exports.srt = resultByState;

//确认某个参数不为空，否则返回错误到前端
assertNotNull = function(obj, res){
	if(!obj || obj === ""){
		rt(false, "参数错误", res);
		return false;
	}
	return true;
}
exports.assert = assertNotNull;