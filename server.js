import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dotenv from 'dotenv';  // for hiding the mongo url

dotenv.config();
const mongoURI = process.env.MONGO_URI

//configuration for cloudinary
    cloudinary.config({ 
        cloud_name: '$$Enter your credentials of Cloudinary here$$',  
        api_key:  '$$Enter your credentials of Cloudinary here$$', 
        api_secret:  '$$Enter your credentials of Cloudinary here$$'// Click 'View API Keys' above to copy your API secret
    });
    

const app = express();
app.use(express.urlencoded({extended:true}));

mongoose.connect(mongoURI,{
    dbName : "nodejsoneshot"
}).then(()=>{console.log("MongoDB connected..!")})
.catch((err)=> console.log(err));

//rendering
app.get('/',(req,res)=>{
    res.render('login.ejs',{url:null});
})
app.get('/register',(req,res)=>{
    res.render('register.ejs',{url:null});
})


const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + path.extname(file.originalname);
      cb(null, file.fieldname +"-"+ uniqueSuffix)
    },
  })
  
  const upload = multer({ storage: storage });

  const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    filename:String,
    public_id:String,
    imgUrl:String
  });
  const User = mongoose.model("user",userSchema);

app.post('/register', upload.single('file'), async (req, res)=> {
    const file = req.file.path
    const {name , email , password} = req.body;
   
    const cloudinaryRes = await cloudinary.uploader.upload(file,{folder:"nodejsoneshot"})
    //creating user
    const db = await User.create({ 
        name,
        email,
        password,
        filename : file.originalname,
        public_id: cloudinaryRes.public_id,
        imgUrl : cloudinaryRes.secure_url,
    });
    res.redirect('/');
    //res.render('register.ejs',{url:cloudinaryRes.secure_url})
    //res.json({message : 'file uploaded successfully',cloudinaryRes});
  })

app.post('/login', async(req,res)=>{
    const {email , password} = req.body;
   console.log(req.body); 
    let user = await User.findOne({email});
    if(!user) {
        res.render("login.ejs")
    }
        else if(user.password != password){
            res.render("login.ejs");
    } else {
        res.render('profile.ejs',{user})
    }
})
const port = 5000;
app.listen(port,(req,res)=>{
    console.log(`server running at port ${port}`);
})
