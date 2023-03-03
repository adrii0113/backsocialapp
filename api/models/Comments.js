const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    postId :{
        type: String,
      required: true,
    },
    text: {
      type: String,
      max: 500,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", PostSchema);