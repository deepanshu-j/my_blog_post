var express = require('express');
var app = express();
var ejs = require('ejs');
var mongoose = require('mongoose');
var request = require('request');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var Post = require('./models/post.js');
var User = require('./models/user.js');

var apiAddress =
	'https://api.openweathermap.org/data/2.5/weather?q=Delhi,India,IN&appid=42865849c80b2a3c2667f2dc5823abc2';
port = 8080;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.static('views'));

app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(bodyParser.json());

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
///data base stuff
mongoose
	.connect('mongodb://localhost:27017/my_blog_post', {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log(`Database connected`);
	})
	.catch((err) => {
		console.error(err);
	});

app.use(
	require('express-session')({
		secret: 'all we have is time',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());

//app.use(new localStrategy(User.authenticate()));
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Post.create({
//         "title": "whats that dish",
//         "url": "https://i.pinimg.com/originals/47/5d/aa/475daa861f6f8f20eba6482d715d45ee.jpg",
//         "description": "it smells nice,idk"
//     },
//     function (err, post) {
//         User.findOne({
//             username: "Deepanshu johar"
//         }, (error, founduser) => {
//             if (err) {
//                 console.log(error)
//             } else {
//                 founduser.posts.push(post);
//                 founduser.save((err, data) => {
//                     if (err) {
//                         console.log(err)
//                     } else {
//                         console.log(data)
//                     }
//                 })
//             }
//         })
//     })

process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason);
	// Application specific logging, throwing an error, or other logic here
});

///**********************************
///////////routes///////////////////
//***********************************

app.get('/', function(req, res, next) {
	Post.find({}, (err, this_post) => {
		if (err) {
			console.log(err);
		} else {
			////remember this posts is an object/////typeof(posts)----->object
			////and this a replacement of the array that we took
			//of the same name

			res.render('index', {
				posts: this_post,
				req: req
			});
		}
	});
});
function isLoggedIn(req, res, next) {
	///when the user is logged in passport adds a property 'user' to the req
	if (req.user) {
		return next();
	}
	return res.redirect('/login');
}
app.get('/NewPost', isLoggedIn, (req, res, next) => {
	res.render('newpost_page', { req: req });
});

app.post('/NewPost', (req, res, next) => {
	Post.create(
		{
			title: req.body.title,
			url: req.body.url,
			description: req.body.description
		},
		function(err, posT) {
			if (err) {
				console.log('error :' + err);
			} else {
				console.log('new post added{posT}\n' + posT);
				console.log('post._id->' + posT._id);
				User.findOne({ _id: req.user._id }, (err2, founduser) => {
					if (err2) {
						console.log(err2);
					} else {
						console.log('user\n' + founduser);
						founduser.posts.push(posT);
						founduser.save((err3, data) => {
							if (err3) {
								console.log(err3);
							} else {
								console.log('data pushed into user\n' + data);
								console.log('founduser._id->' + founduser._id);
								console.log('founduser.username->' + founduser.username);
								Post.updateOne(
									{ _id: posT._id },
									{ $set: { creator: founduser._id } },
									(err4, update) => {
										if (err4) {
											console.log(err4);
										} else {
											console.log('update:\n' + update);
										}
									}
								);
							}
						});
					}
				});
			}
		}
	);
	////after this we'll also add creator attribute//////baad me

	res.redirect('/');
});

app.get('/readmore/:id', (req, res, next) => {
	_identity = req.params.id;
	var isTheSameUser = false;
	// if (isTheSameUser == _identity) isTheSameUser = true;
	// else isTheSameUser = false;

	//console.log('\nreq.user:\n' + req.user);

	///console.log(typeof (titlE))//string
	///now search the db and send all the data from that....
	//console.log(req.body)

	////console.log("typeof (_identity))///string
	//////////doubt//////////i don't know why it's not rendering
	///////readMore file properly////////its not including the scripts
	Post.find(
		{
			_id: _identity
		},
		(err, obj) => {
			if (err) {
				console.log(err);
			} else {
				var isTheSameUser = false;

				if (req.user == undefined) {
				} else {
					var x = JSON.stringify(obj[0].creator, (k, v) => (v === undefined ? null : v));
					var y = `"${req.user._id.toString()}"`;
					console.log(x == y);
					if (x == y) {
						isTheSameUser = true;
					}
				}

				///console.log(typeof obj);////object
				res.render('readMore', {
					poSt: obj,
					req: req,
					isTheSameUser: isTheSameUser
				});
			}
		}
	);
});

app.get('/login', (req, res, next) => {
	res.render('login', { req: req });
});
app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}),
	(req, res, next) => {}
);

app.get('/signup', (req, res, next) => {
	res.render('signUp', { req: req });
});

app.post('/signup', function(req, res, next) {
	// User.create(
	// 	{
	// 		username: req.body.username,
	// 		password: req.body.password
	// 	},
	// 	(err, data) => {
	// 		if (err) {
	// 			console.log(err);
	// 		} else {
	// 			console.log(data);
	// 		}
	// 	}
	// );
	User.register(new User({ username: req.body.username, posts: [] }), req.body.password, function(err, user) {
		if (err) {
			console.log(err);
			return res.render('signup', { req: req });
		}
		passport.authenticate('local')(req, res, function() {
			{
				res.redirect('/');
			}
		});
	});

	res.redirect('/');
});
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});
app.get('/about', (req, res, next) => {
	res.render('about', { req: req });
});

app.get('/contactus', (req, res, next) => {
	res.render('contactMe', { req: req });
});
app.get('/weather', (req, res, next) => {
	request(apiAddress, function(err, response, body) {
		if (err) {
			console.log('error message :' + err);
		} else {
			// if (res.statusCode == 200 && !err) { // console.log(typeof (body));////string
			///so to convert it into json we'll parse it
			if (response.statusCode == 200) {
				var parsedData = JSON.parse(body);
				var nature = parsedData.weather[0].main;
				var temp = parsedData.main.temp;
				res.render('weather', {
					nature: nature,
					temp: (temp - 273.15).toFixed(2),
					req: req
				});
			}
		}
	});
});

/////starting up the server
app.listen(port, function(err, req, res, next) {
	if (err) {
		console.log('something went wrong');
		console.log(err);
	} else {
		console.log('server started at port(for my_blog ) :' + port);
	}
});
