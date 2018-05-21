var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');

// OBTENER TODOS LOS HOSPITALES
app.get('/', ( req, res, next ) => {
    var page = req.query.page || 0;
    page = Number(page);

    Hospital.find({})
    .skip(page)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec( 
        (err, hospitales ) => {
            if( err ) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los Hospitales',
                    errors: err
                });
            }
            
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    Hospitales: hospitales,
                    total: conteo
                });
            })
        }
    );
    // res.send('Exito');
});

// CREAR HOSPITAL
 app.post('/', mdAutenticacion.verificaToken, (req, res ) => {
    var body = req.body;
    
    var hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario._id
    });

    hospital.save( ( err, hospitalSave ) => {
        if( err ) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalSave
        });
    });
 });

//  ACTUALIZAR HOSPITAL
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, ( err, hospital ) => {
        if( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario!',
                errors: err
            });
        }
        if( !hospital ) {
            res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;
        
        hospital.save( (err, hospitalSave) => {
            if( err ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hopital',
                    errors: err
                });
            }
            
            res.status(200).json({
                ok: true,
                hospital: hospitalSave
            });
        });
    }); 
});

// ELIMINAR HOSPITAL POR ID
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, ( err, hospitalDelete ) => {
        if( err ){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }
        
        if( !hospitalDelete ){
            res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el hospital',
                errors: { message: 'No se encontro el hospital con el id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalDelete
        });
    })
});

module.exports = app;