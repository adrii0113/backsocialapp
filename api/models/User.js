// conexion con mongodb
const mongooseClient = require('mongoose');
// const validator = require('validator');
// import {isEmail} from 'validator';
const jwt = require("jsonwebtoken");
// definimos el esquema de base de datos

const UserSchema = new mongooseClient.Schema({
    nombreUsuario:{
        type : String,
        required : true,
        min: 5,
        max: 15,
        // unique : true
        
    },

    nombreCompleto:{
        type : String,
        required : true,
        min: 12,
        max: 30,
        // unique : false
    },
    email:{
        type : String,
        required : true,
        // validate: [ isEmail, 'El correo electronico no cumple el form' ],
        // unique : true
    },
    password:{
        type : String,
        required : true
    },

    fechaNacimiento: {
        type: Date,
        required : false,
    },
    aficiones: {
        type: String,
        required : false,
        default: ''
    },
    imagenPerfil: {
        type: String,
        default: ''
    },
    // en el array se almacenaran los ids de los seguidores de cada usuario
    seguidores: {
        type:Array,
        default: []
    },
    // telefono:{
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // en el array se almacenaran los ids de los usuarios a los que sigue
    seguidos:{
        type:Array,
        default: []
    },
    ciudad: {
        type:String,
        max:30
    },
    // se almacena la bografia del usuario
    biografia:{
        type:String,
        max: 150

    },
    // con este campo comprobamos si el usuario es administrador de la aplicacion
    admin: {
        type:Boolean,
        default: false
    }
    
   
},
// con este campo automatizamos la fecha de creacion del ususario 
{timestamps:true}
)

UserSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};

// exportamos el esquema
module.exports = mongooseClient.model("User", UserSchema);