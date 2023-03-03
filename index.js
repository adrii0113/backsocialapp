const express = require('express');
// aplicacion de express
const app = express();

// cliente de mongodb
const mongooseClient = require('mongoose');
// dotenv
const dotenv = require('dotenv');
// middleware
const helmet = require('helmet');


// IMAGES
const { cloudinary } = require('./api/utils/cloudinary');
const morgan = require('morgan');
const cors = require('cors');
const multer = require("multer");

const path = require("path");
// import fileUpload from 'express-fileupload';
// const config = require('./config');
// configuracion expres
const config = {
    application: {
        cors: {
            server: [
                {
                    origin: "*", //servidor que deseas que consuma o (*) en caso que sea acceso libre
                    credentials: true
                }
            ]
        }
}}

// importamos las rutas de los usuarios
const userRoutes = require('./api/routes/userRoutes')
// importamos la rutas de autenticacion y registro
const authRoutes = require('./api/routes/authRoutes')
//importamos la ruta de los posts
const postRoute = require('./api/routes/postsRoutes')
// importamos la ruta de las acciones del chat
const chatRoute = require('./api/routes/chatRoutes');
dotenv.config();

app.use(cors(
    config.application.cors.server
  ));

//   configuracion de express-fileupload
// app.use(fileUpload({
//     useTempFiles : true,
//     tempFileDir: './uploads'
// }));

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// conectamos el cliente de mongo DB con la base de datos, pasandole como argumentos a la funcion connect la ruta de conexion que se encuentra en el archivo .env
mongooseClient.connect(process.env.MONGO_URL, {useNewUrlParser: true},()=>{
    // Mensaje de confirmacion de conexion
    try {
        console.log('Conectado a bbdd')
    // Mensaje de error
    } catch (error) {
        console.error(error);
    }
})
// 
app.use("/images", express.static(path.join(__dirname, "public/images")));
// Configuracion del middleware
// Express JS y helmet
// Esta parte se utiliza para controlar las peticiones que se realizan a nuestra base de datos
app.use(express.json())
app.use(helmet());
app.use(morgan('common'));




app.get('/api/images', async (req, res) => {
  const { resources } = await cloudinary.search
      .expression('folder:upload_')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

  const publicIds = resources.map((file) => file.public_id);
  res.send(publicIds);
});

app.post('/api/upload', async (req, res) => {
  try {
      const fileStr = req.body.data;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
          upload_preset: 'upload_',
      });
    //   console.log(uploadResponse);
    //   res.json({public_id: res.public_id, url: res.secure_url})
      res.json(uploadResponse)
  } catch (err) {
      console.error(err);
      res.status(500).json({ err: 'Something went wrong' });
  }
});
// cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test"}, async(err, result)=>{
//     if(err) throw err;

//     removeTmp(file.tempFilePath)

//     res.json({public_id: result.public_id, url: result.secure_url})
// })


//cuando el usuario utilice esta ruta le pasamos como argumento las rutas de lo usuarios
app.use('/api/users', userRoutes);
app.use('/api/auth',  authRoutes);
app.use('/api/posts', postRoute)
app.use('/api/chat', chatRoute);


// 404
app.use((req, res, next) => {
  res.status(404).send(
      "<h1>Esta pagina no existe</h1>")
})
// le especificamos el puerto de escucha
app.listen( 8800,() =>{
    console.log('SERVER INICIADO');
})