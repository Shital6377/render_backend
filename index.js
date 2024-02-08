const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const EmployeeModel = require('./models/Employee')

const app = express()
app.use(cors(
    {
        origin: ["http://localhost:5173"], // https://mern-user-create.vercel.app
        methods: ["POST", "GET"],
        credentials: true
    }
));
app.use(express.json())

const dbUrl =  "mongodb+srv://sarmistha1:sarmistha@cluster0.npn1qmh.mongodb.net/store";

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(dbUrl, connectionParams)


app.get("/", (req, res) => {
    res.json("Hello");
})

app.post('/login',(req,res)=>{
    const{email,password}=req.body;
    EmployeeModel.findOne({email: email})
    .then(user=>{
        if(user){
            if(user.password === password){
                res.json('success')
            }
            else{
                res.json('The password is incorrect')
            }
        } else{
            res.json('No record existed')
        }
    })
})

app.post('/register',(req,res)=>{
    EmployeeModel.create(req.body)
    .then(employee => res.json(employee))
    .catch(err => res.json(err))
})


app.listen(3001, () => {
    console.log("Server is Running on port", 3001)
})
