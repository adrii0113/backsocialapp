//conexion con la base de datos
const mongooseClient = require('mongoose');
//definir el esquema de base de datos
const RoutineSchema = new mongooseClient.Schema({

    nombreRutina:{
        type: String,
        requiered: true,
        min: 5,
        max: 20,
        unique: false
    },
    descripcionRutina:{

    },

    




})