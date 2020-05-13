var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

////schema for user(username-password)
var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	posts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post'
		}
	]
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
