var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Usuarios = require('../models/usuario');

// OBTENER TODOS LOS USUARIOS

app.get('/', ( req, res, next ) => {
    Usuarios.find({}, 'nombre email img role')
    .exec( 
        (err, usuarios ) => {
            if( err ) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los usuarios',
                    errors: err
                });
            }
    
            res.status(200).json({
                ok: true,
                Usuarios: usuarios
            });
        }
    );
    // res.send('Exito');
});

// CREAR USUARIO
 app.post('/', mdAutenticacion.verificaToken, (req, res ) => {
    var body = req.body;
    
    var usuario = new Usuarios({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( ( err, usuarioSave ) => {
        if( err ) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioSave,
            usuarioToken: req.usuario
        });
    });
 });

//  ACTUALIZAR USUARIO
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuarios.findById( id, ( err, usuario ) => {
        if( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario!',
                errors: err
            });
        }
        if( !usuario ) {
            res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre
        usuario.email = body.email;
        usuario.role = body.role;
        
        usuario.save( (err, usuarioSave) => {
            if( err ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuarioSave.password = ':)';
            
            res.status(200).json({
                ok: true,
                usuario: usuarioSave
            });
        });
    }); 
});

// Eliminar un usuario po id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuarios.findByIdAndRemove(id, ( err, usuarioBorrado ) => {
        if( err ){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }
        
        if( !usuarioBorrado ){
            res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el usuario',
                errors: { message: 'No se encontro el usuario con el id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;