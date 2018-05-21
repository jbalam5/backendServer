var  express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');

app.get('/:type/:img', ( req, res, next ) => {
    var type = req.params.type;
    var img = req.params.img;
    
    var pathImagen  = path.resolve( __dirname, `../uploads/${ type }/${ img }`);
    
    if( fs.existsSync(pathImagen) ){
        res.sendFile(pathImagen);
    }else{
        var pathNotFound = path.resolve( __dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNotFound);
    }
});

module.exports = app;