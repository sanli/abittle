
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.redirect(302, '/index.html');
};