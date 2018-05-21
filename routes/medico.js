var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Medicos = require('../models/medico');

// OBTENER TODOS LOS MEDICOS

app.get('/', ( req, res, next ) => {
    var page = req.query.page || 0;
    page = Number(page);
    
    Medicos.find({})
    .skip(page)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec( 
        (err, medicos ) => {
            if( err ) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar la lista de medicos',
                    errors: err
                });
            }
            
            Medicos.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    Medicos: medicos,
                    total: conteo
                });
            });
        }
    );
});

// CREAR MEDICO
 app.post('/', mdAutenticacion.verificaToken, (req, res ) => {
    var body = req.body;
    
    var medico = new Medicos({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( ( err, medicoSave ) => {
        if( err ) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoSave
        });
    });
 });

//  ACTUALIZAR MEDICO
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medicos.findById( id, ( err, medico ) => {
        if( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico!',
                errors: err
            });
        }
        if( !medico ) {
            res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id' + id + 'no existe',
                errors: { message: 'No existe algun medico con ese ID' }
            });
        }

        medico.nombre = body.nombre
        // medico.img = body.email;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        
        medico.save( (err, medicoSave) => {
            if( err ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
            
            res.status(200).json({
                ok: true,
                medico: medicoSave
            });
        });
    }); 
});

// Eliminar un usuario po id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medicos.findByIdAndRemove(id, ( err, medicoDelete ) => {
        if( err ){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }
        
        if( !medicoDelete ){
            res.status(400).json({
                ok: false,
                mensaje: 'No se encontro los datos del medico',
                errors: { message: 'No se encontro el medico con el id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoDelete
        });
    })
});

module.exports = app;