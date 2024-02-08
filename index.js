const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const EmployeeModel = require('./models/Employee');

const app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    "access-control-allow-credentials": true, // access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

const dbUrl = "mongodb+srv://sarmistha1:sarmistha@cluster0.npn1qmh.mongodb.net/store";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};


const connectDB = () => {

    mongoose.connect(dbUrl, connectionParams).then((res) => {
        console.log(`Successfully connected to MongoDB 👍`);
    }).catch((error) => {
        console.error(`Error: ${error.message}`);
    })

};

connectDB();

app.get("/", (req, res) => {
    return res.json("Hello");
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    EmployeeModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json('success')
                }
                else {
                    res.json('The password is incorrect')
                }
            } else {
                res.json('No record existed')
            }
        })
})

app.post('/register', (req, res) => {
    EmployeeModel.create(req.body)
        .then(employee => res.json(employee))
        .catch(err => res.json(err))
})


app.listen(4000, () => {
    console.log("Server is Running on port", 4000)
})
