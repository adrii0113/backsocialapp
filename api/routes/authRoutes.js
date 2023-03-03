const router = require('express').Router();
const User = require('./../models/User');
const bcrypt = require('bcrypt');
const validate = require("./../utils/validation")

const Token = require('./../models/Token');
const sendMail = require('./../utils/sendEmail');
const crypto = require('crypto');

// rutas de registro 
router.post('/registro', async (req, res) => {

    try {
        //se busca en la bbdd el email definido por el usuario en el formulario
        let userDefined = await User.findOne({email:req.body.email})

        if(userDefined){
          return res.status(409).send({message:"El usuario ya existe"})
        }
        // // encriptar la contraseña
        const encrypt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, encrypt);
        // crecion del nuevo usuario
        const newUser =  new User(
            {
              nombreUsuario: req.body.nombreUsuario,
              nombreCompleto: req.body.nombreCompleto,
              email: req.body.email,
              // ciudad: req.body.ciudad,
              // aficiones:req.body.aficiones,
              // fechaNacimiento:req.body.fechaNacimiento,
              password: hashedPassword
    
            }
        );

        // guardar el usuario, y repsonder con una confirmacion
        const user = await newUser.save();  
        // const token = await new Token({
        //   userId: user._id,
        //   token: crypto.randomBytes(32).toString("hex"),
        // }).save();
        // const url = `${process.env.BASE_URL}api/users/${user.id}/verify/${token.token}`;
        // await sendMail(user.email, "Verify Email", url);
    
        // res
        //   .status(201)
        //   .send({ message: "An Email sent to your account please verify" });
        res.status(200).json(user);
        
    } catch (error) {
        res.status(500).json(error)
    }
        
})

router.post('/test', async(req,res) =>{
  // console.log(req.params)
  // console.log(res.status(200))
  res.status(200)
  console.log(req.body.params.email)
  const newUser =  new User(
    {
      nombreUsuario: req.body.params.nombreUsuario,
      nombreCompleto: req.body.params.nombreCompleto,
      email: req.body.params.email,
      password: req.body.params.password

    }
);
const user = await newUser.save();  
res.status(200).json(user);
})


// *LOGIN*
router.post("/login", async (req, res) => {
  
    try {
      
      //primero validamos el formato de los datos introducidos
      const {error} = validate(req.body);
      if(error) return res.sendStatus(400).send({ message: error.details[0].message });
      // en caso de que la validacion sea correcta se busca el usuario en la bbbdd
      const user = await User.findOne({ email: req.body.email });
      !user && res.sendStatus(404).json("no se ha encontrado el usuario solicitado");
      
      const validPassword = await bcrypt.compare(req.body.password, user.password)
      !validPassword && res.sendStatus(400).json("contraseña incorrecta")
      

      // lo del tojen queda pendiente
      // generar token de autenticacion
      // const token = User.generateAuthToken();
      //  res.status(200).send({ data: token, message: "Inicio de sesion correcto" });
      
      
      return  res.status(200).json(user)
    } catch (err) {
        // si hay error se responde un mensaje de error
      return res.status(500).json(err)
    }
  });
// router.post("/login", async (req, res) => {
// 	try {
// 		// const { error } = validate(req.body);
// 		// if (error)
// 		// 	return res.status(400).send({ message: error.details[0].message });

// 		const user = await User.findOne({ email: req.body.email });
// 		if (!user)
// 			return res.status(401).send({ message: "Invalid Email or Password" });

// 		const validPassword = await bcrypt.compare(
// 			req.body.password,
// 			user.password
// 		);
// 		if (!validPassword)
// 			return res.status(401).send({ message: "Invalid Email or Password" });

// 		// const token = user.generateAuthToken();
// 		// res.status(200).send({ data: token, message: "logged in successfully" });
// 	} catch (error) {
// 		// res.status(500).send({ message: "Internal Server Error" });
//     return res.status(500).json(error)
// 	}
// });
// exportamos el cliente de mongodb
module.exports = router;


