var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var Usuarios = require('../models/usuario');

var SEED = require('../config/config').SEED;

// GOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// AUTENTICACION NORMAL
app.post('/', (req, res) => {
    var body = req.body;
    Usuarios.findOne({email : body.email}, (err, usuarioBD) => {
        
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario!',
                errors: err
            });
        }

        if(!usuarioBD){
            return res.status(400).json({
                ok: false,
                usuario: 'Credenciales no validas',
                errors: err
            });
        }

        if(!bcrypt.compareSync( body.password, usuarioBD.password) ){
            return res.status(400).json({
                ok: false,
                usuario: 'Credenciales no validas',
                errors: err
            });
        }
        // crear token
        usuarioBD.password = '...';
        
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }) // 4horas
        // 
        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
});

// AUTENTICACION GOOGLE

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch( e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });
    
    Usuarios.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario!',
                errors: err
            });
        }

        if( usuarioBD ) {
            if( usuarioBD.google === false ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se autentico por GOOGLE.'
                });
            }else{
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }) // 4horas
                
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            }
        }else{
            // el usuario no existe. Se creará
            var usuario = new Usuarios();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'none';

            usuario.save( (err, usuarioBD) => {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }) // 4horas
                
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            });
        }
    });
});

module.exports = app;