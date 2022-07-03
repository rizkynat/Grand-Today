const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'green_today'
});

const app = express();
app.use(express.static(__dirname));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let email_retailer = request.body.email_retailer;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (email_retailer && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM retailer WHERE email_retailer = ? AND password = ?', [email_retailer, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.email_retailer = email_retailer;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Passwordd!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		//response.send('Welcome back, ' + request.session.email_retailer + '!');
		app.set("views", path.join(__dirname, "views"));
		app.set('view engine','ejs');
		app.engine('ejs', require('ejs').__express);
		var val = request.session.email_retailer;
		response.render('beranda',{email_retailer:val});
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/logout', function(request, response){
	request.session.destroy();
	response.redirect("/");
});

app.get('/inputItem',function(request, response){
	app.set("views", path.join(__dirname, "views"));
		app.set('view engine','ejs');
		app.engine('ejs', require('ejs').__express);
		var val = request.session.email_retailer;
		response.render('beranda',{email_retailer:val});
})

app.listen(3000, () => console.log('The server is running port 3000...:))'));