var mongoose = require('mongoose');

//schema for a post
var postSchema = new mongoose.Schema({
	title: String,
	url: String,
	description: String,
	creator: mongoose.Schema.Types.ObjectId
	////whenever i will create a post i will after making that post
	////i will add the creator attribute after creating it
	////and then i'll be able to refernce it's user/////basically set many-to-many relationship
	// creator: {
	//     type: mongoose.Schema.Types.ObjectId,
	//     ref: User
	// }
});

//pass that schema into model and make a model
module.exports = mongoose.model('Post', postSchema);
//now Post is a model
