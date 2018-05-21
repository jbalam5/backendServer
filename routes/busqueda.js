var  express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// BUSQUEDA POR COLECCIOM
app.get('/coleccion/:table/:search', (req, res) => {
    var search = req.params.search;
    var regex = new RegExp( search, 'i');

    var table = req.params.table;
    var promesa; 

    switch (table) {
        case 'usuarios':
            promesa = searchUsuario(search, regex)        ;
            break;
        case 'medicos':
            promesa = searchMedicos(search, regex);
            break;
        case 'hospitales':
            promesa = searchHospitales(search, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los parametros de busqueda no son validos.',
                error: { mensaje: 'Tipo de busqueda no valida'}
            });
            break;
    }
    
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });
});

// BUSQUEDA GENERAL
app.get('/all/:search', ( req, res, next ) => {
    var termino = req.params.search;
    var regex = new RegExp( termino, 'i');
    
    Promise.all( [ 
        searchHospitales(termino, regex),
        searchMedicos(termino, regex),
        searchUsuario(termino, regex)
    ]).then( response => {
        res.status(200).json({
            ok: true,
            hospitales: response[0],
            medicos: response[1],
            usuarios: response[2]
        });
    });
});

function searchHospitales( termino, regex ){

    return new Promise( (resolve, reject )=> {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if(err)
                    reject('Error al cargar hospitales', err);
                else
                    resolve(hospitales);
            });
    })
}

function searchMedicos( termino, regex ){

    return new Promise( (resolve, reject )=> {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if(err)
                    reject('Error al cargar medicos', err);
                else
                    resolve(medicos);
            });
    })
}

function searchUsuario( termino, regex ){

    return new Promise( (resolve, reject )=> {
        Usuario.find({}, 'nombre email role')
            .or([ {'nombre': regex }, {'email': regex}])
            .exec( (err, usuarios) => {
                if(err)
                    reject('Error al cargar Usuarios', err);
                else
                    resolve(usuarios);
            });
    })
}

module.exports = app;