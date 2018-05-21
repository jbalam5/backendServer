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
var usuarioRoutes = require('./routes/usuario');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var busquedaRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');
var imagenesRoute = require('./routes/imagenes');
// CONEXION A LA BD
mongoose.connection.openUri('mongodb://localhost:27017/enterpriseDB', ( err, res ) => {
    if( err ) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
    
});
// server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoute);
app.use('/upload', uploadRoute);
app.use('/img', imagenesRoute);
app.use('/', appRoutes);

 // ESCUCHAR PETICIONES
app.listen(3000, () => {
    console.log('Expres server listen 3000: \x1b[32m%s\x1b[0m','online');
});
