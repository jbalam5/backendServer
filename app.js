var express = require('express'); // REQUIRES
var mongoose = require('mongoose');
var app = express(); // INICIALIZAR VARIABLES

// CONEXION A LA BD
mongoose.connection.openUri('mongodb://localhost:27017/enterpriseDB', ( err, res ) => {
    if( err ) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
    
})

 // ESCUCHAR PETICIONES
app.listen(3000, () => {
    console.log('Expres server listen 3000: \x1b[32m%s\x1b[0m','online');
});

// RUTAS
app.get('/', ( req, res, next ) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion finalizada correctamente.'
    });
    // res.send('Exito');
});
