//requerimos el modelo del usuario
const usuario = require("./../models/User");

//libreria para encriptar la password
const bcrypt = require('bcrypt');


//definimos los metodos para realizar acciones con los usuarios
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


// eliminar un ususario
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


// obtener un usuario por id
router.get("/:id",async (req,res)=>{
  if (req.body.userId === req.params.id || req.body.admin) {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).json(user.nombreCompleto);
    } catch (error) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Solo puedes mostrar tu cuenta!");
  }
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
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { seguidores: req.body.userId } });
          await currentUser.updateOne({ $pull: { seguidos: req.params.id } });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you dont follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
  });
