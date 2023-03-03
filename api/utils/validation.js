
// imports
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const Router = require("express").Router();
const {User} = require("./../models/User");
// funcion para validar, utilizando el paquete JOI
const validateForm = (data) =>{

    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        // password :passwordComplexity().validate("Password")
    });

    return schema.validate(data);


}

module.exports = validateForm;