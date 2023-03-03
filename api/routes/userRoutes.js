// definimos el router de express
const router = require('express').Router();
//libreria para encriptar la password
const bcrypt = require('bcrypt');

const User = require('./../models/User');

// requerimos el modelo del token de verificacion
const multer = require("multer");

const path = require("path");


// rutas para realizar las acciones de los usuarios
//actualizar los datos de los usuarios
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.admin) {
      if (req.body.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
          return res.status(500).json(err);
        }
      }
      try {
        const user = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        });
        res.status(200).json("La cuenta ha sido actualizada");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("Solo puedes actualizar tu cuenta!");
    }
  });


// eliminar un ususario si eres el prppietario de la cuenta
router.delete("/:id", async (req, res) => {
  // si el id que le pasamos coincide con el id del usuario 
  if (req.body.userId === req.params.id || req.body.admin) {
    // se utiliza el metodo para encontrar y eliminar el usuario
    try {
      await User.findByIdAndDelete(req.params.id);
      // mensaje de confirmacion si todo ha ido bien
      res.status(200).json("La cuenta ha sido eliminada");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    // en caso contrario mostramos un mensaje de error
    return res.status(403).json("Solo puedes eliminar tu cuenta!");
  }
});

// eliminar un usuario si eres administrador
router.delete("/adminDelete/:id", async (req,res) =>{

  try {
    await User.findByIdAndDelete(req.params.id);
    // mensaje de confirmacion si todo ha ido bien
    res.status(200).json("La cuenta ha sido eliminada");
  } catch (err) {
    return res.status(500).json(err);
  }
})





// obtener un usuario por id
router.post("/:id",async (req,res)=>{
  // if (req.body.userId === req.params.id || req.body.admin) {
    try {
      const user = await User.findById(req.params.id);
     
      res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  // } else {
    // return res.status(403).json("Solo puedes mostrar tu cuenta!");
  // }
  // console.log("bien")
})

//ruta para seguir a un usuario

router.put("/:id/seguir", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      
      if (!user.seguidores.includes(req.body.userId)) {
        await user.updateOne({ $push: { seguidores: req.body.userId } });
        await currentUser.updateOne({ $push: { seguidos: req.params.id } });
        res.status(200).json("acabas de seguir a este usuario");
      } else {
        res.status(403).json("ya sigues a este usuario");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("no puedes seguirte a ti mismo");
  }
});

//dejar de seguir a un usuario

router.put("/:id/dejarseguir", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.seguidores.includes(req.body.userId)) {
          await user.updateOne({ $pull: { seguidores: req.body.userId } });
          await currentUser.updateOne({ $pull: { seguidos: req.params.id } });
          res.status(200).json("acabas de dejar de seguir el usuario");
        } else {
          res.status(403).json("todavia no sigues a este usuario");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("no puedes dejar de seguir tu propia cuenta");
    }
  });

  // get a user
  router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const nombreUsuario = req.query.nombreUsuario;
    try {
      const user = userId
        ? await User.findById(userId)
        : await User.findOne({ nombreUsuario: nombreUsuario });
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(other);
    } catch (err) {
      res.status(500).json(err);
    }
  });



  //recoger los seguidores un usuario en concreto
  router.get("/:id/seguidores",async (req,res)=>{
    if (req.body.userId === req.params.id || req.body.admin) {
      try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user.seguidores);
      } catch (error) {
        return res.status(500).json(error);
      }
    } else {
      return res.status(403).json("Solo puedes mostrar los seguidores de tu cuenta");
    }
  })


  // obtener amigos
  router.get("/friends/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const friends = await Promise.all(
        user.seguidos.map((friendId) => {
          return User.findById(friendId);
        })
      );
      let friendList = [];
      friends.map((friend) => {
        const { _id, nombreUsuario, imagenPerfil } = friend;
        friendList.push({ _id, nombreUsuario, imagenPerfil });
      });
      res.status(200).json(friendList)
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // router.post("/", async (req,res)=>{
  //   try {
  //     User.find({
  //       userId:"62375ea2f374306c90e346be"
  //     })
  //     User.find({ 
  //       userId:"62375ea2f374306c90e346be"
  //     }, function callback(error, a) {
      
  //     // aquí si exite a
  //     console.log(a)
  //     })
  //     console.log("s")
  //   } catch (error) {
      
  //   }
  // })

  const Token = require('./../models/Token');
  const sendEmail = require('./../utils/sendEmail');
  const crypto = require('crypto');
// const { Users } = require('../../../fitnessocialDesign/app/src/dummyData');


  // ruta para la verificacion de email
  //aqui es una prueba
  router.post("/", async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res.status(400).send({ message: error.details[0].message });
  
      let user = await User.findOne({ email: req.body.email });
      if (user)
        return res
          .status(409)
          .send({ message: "User with given email already Exist!" });
  
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.password, salt);
  
      user = await new User({ ...req.body, password: hashPassword }).save();
  
      const token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `$http://localhost:8800/api/users/${user.id}/verify/${token.token}`;
      await sendEmail(user.email, "Verify Email", url);
  
      res
        .status(201)
        .send({ message: "An Email sent to your account please verify" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });
  
  router.get("/:id/verify/:token/", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      if (!user) return res.status(400).send({ message: "Invalid link" });
  
      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      });
      if (!token) return res.status(400).send({ message: "Invalid link" });
  
      await User.updateOne({ _id: user._id, verified: true });
      await token.remove();
  
      res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  });


  // ruta para obtener los datos de todos los usuarios
  router.get("/allusers", async(req,res) =>{
    
        try {
          const user = await User.find();
          res.status(200).json(user);
        } catch (error) {
          return res.status(500).json(err);
        }
      
  })
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });
  const upload = multer();
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {

      res.status(200).json("File uploded successfully");
    } catch (error) {
      // console.error(error);
    }
  });


module.exports = router;

