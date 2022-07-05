const DB = require('./DB.js')
const express = require('express');
const session = require('express-session');
const path = require('path');
const { request } = require('http');
const { response } = require('express');
const { data } = require('jquery');

const con = DB;
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
		con.query('SELECT * FROM retailer WHERE email_retailer = ? AND password = ?', [email_retailer, password], function(error, results, fields) {
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

app.post('/inputItem', function(request, response){
	let nama_item = request.body.nama_item;
	let kategori = request.body.kategori;
	let foto_item = request.body.foto_item;
	let harga_item = request.body.harga_item;
	let satuan_unit = request.body.satuan_unit;

	let sql = `insert into item (nama_item, kategori, foto_item, harga_item, satuan_unit) values ("${nama_item}", "${kategori}","${foto_item}","${harga_item}","${satuan_unit}")`;
	let values = [nama_item, kategori, foto_item, harga_item, satuan_unit];

	con.query(sql, [values], function(err, result){
		if (err) throw err;
		response.redirect('/inputItem');
	});
})

app.get('/lihatItem', function(request,response){
	var sql = 'select * from item';
	con.query(sql, function(error, rows){
		if (error) {
            return response.status(500).json({ message: 'Ada kesalahan', error: error });
        }

        // jika request berhasil
        response.status(200).json({ success: true, data: rows });
	})
})

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		//response.send('Welcome back, ' + request.session.email_retailer + '!');
		//app.set("views", path.join(__dirname, "views"));
		app.set('view engine','ejs');
		app.engine('ejs', require('ejs').__express);
		var val = request.session.email_retailer;
		response.render(path.join(__dirname, 'views/pages/beranda.ejs'),{email_retailer:val});
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
	//app.set("views", path.join(__dirname, "views"));
		app.set('view engine','ejs');
		app.engine('ejs', require('ejs').__express);
		var val = request.session.email_retailer;
		response.render(path.join(__dirname, 'views/pages/form.ejs'),{email_retailer:val});
})

app.listen(3000, () => console.log('The server is running port 3000...:))'));