var  express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.use(fileUpload());

app.put('/:tipo/:id', ( req, res, next ) => {
    var type = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var typeValidos = ['hospitales', 'medicos', 'usuarios'];

    if(typeValidos.indexOf(type) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colacción no valido',
            errors: { message: 'Tipo de colacción no valido'}
        });
    }

    if( !req.files ){
        res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó una imagen',
            errors: { message: 'Debe seleccionar una imagen'}
        });
    }
    // obtener nombre del archivo
    var nameFile = req.files.imagen;
    var dataFile = nameFile.name.split('.');
    var extFile = dataFile[dataFile.length -1 ];

    // extencopmes permitidas
    var extValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if( extValidas.indexOf(extFile) < 0){
        res.status(400).json({
            ok: false,
            mensaje: 'Extencion no valida',
            errors: { message: 'Solo se permiten archivos: '+ extValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var newFileName = `${ id }-${ new Date().getMilliseconds() }.${ extFile }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ type }/${ newFileName }`;

    nameFile.mv( path, err => {
        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        uploadByType(type, id, newFileName, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extFile: extFile
        // });
    });
});

function uploadByType(type, id, fileName, res){
    switch (type) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if(!usuario){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario no existe',
                        errors: { message: 'El usuario no existe'}
                    });
                }

                var beforePath = './uploads/usuarios/'+usuario.img;
                
                //si existe elimina el archivo
                if(fs.existsSync(beforePath)){
                    fs.unlink(beforePath);
                }
                
                usuario.img = fileName;
                usuario.save((err, usuarioUpdate) => {
                    usuarioUpdate.password = '...';
                    res.status(200).json({
                        ok: true,
                        mensaje: 'imagen de usuario actualizado',
                        usuario: usuarioUpdate
                    });
                });
            });

            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {

                if(!medico){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El medico no existe',
                        errors: { message: 'El medico no existe'}
                    });
                }

                var beforePath = './uploads/medicos/'+medico.img;
                
                //si existe elimina el archivo
                if(fs.existsSync(beforePath)){
                    fs.unlink(beforePath);
                }
                
                medico.img = fileName;
                medico.save((err, medicoUpdate) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'imagen del medico actualizado',
                        medico: medicoUpdate
                    });
                });
            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {

                if(!hospital){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital no existe',
                        errors: { message: 'El hospital no existe'}
                    });
                }

                var beforePath = './uploads/hospitales/'+hospital.img;
                
                //si existe elimina el archivo
                if(fs.existsSync(beforePath)){
                    fs.unlink(beforePath);
                }
                
                hospital.img = fileName;
                hospital.save((err, hospitalUpdate) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'imagen del hospital actualizado',
                        hospital: hospitalUpdate
                    });
                });
            });
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'El tipo de coleccion no es valido',
                errors: { message: 'El tipo de coleccion no es valido'}
            });
            break;
    }
}

module.exports = app;