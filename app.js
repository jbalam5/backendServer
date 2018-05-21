var express = require('express'); // REQUIRES
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express(); // INICIALIZAR VARIABLES

// BODY PARSER
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//  IMPORTAR RUTAS
var appRoutes = require('./routes/app');
var usuariosRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
// CONEXION A LA BD
mongoose.connection.openUri('mongodb://localhost:27017/enterpriseDB', ( err, res ) => {
    if( err ) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
    
});

// RUTAS
app.use('/usuario', usuariosRoutes);
app.use('/', appRoutes);
app.use('/login', loginRoutes);
 // ESCUCHAR PETICIONES
app.listen(3000, () => {
    console.log('Expres server listen 3000: \x1b[32m%s\x1b[0m','online');
});
