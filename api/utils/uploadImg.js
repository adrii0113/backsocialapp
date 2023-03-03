async function uploadImage(file) { // file from <input type="file"> 
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", NAME_OF_UPLOAD_PRESET);
  
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${YOUR_ID}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    const img = await res.json();
    // Post `img.secure_url` to your server and save to MongoDB
  }

  module.exports = uploadImage;