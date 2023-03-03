// conexion con la base de datos
const mongoose = require("mongoose");

// definicion del esquema de base de datos

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
      default : '',
    },
    likes: {
      type: Array,
      default: [],
    },
    comments:{
      
      userId: String,
      text: String,
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

// exportacion del esquema de base de datos
module.exports = mongoose.model("Post", PostSchema);