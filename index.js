const connString = "mongodb+srv://alisutech:4trakAC58HpFkJRe@cluster0.owyxomq.mongodb.net/TechOriginDB"

var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
const express = require('express')
const path = require("path");
const mongoose = require('mongoose')
mongoose.set("strictQuery", true)

mongoose.connect(connString)
const secretKey = 'F66AF290518D50B0E1079744F4A035F8'

const app = express()
app.use(express.json())

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Acces4s-Control-Allow-Methods",
        "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
    next();
});


const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    gender: String,
    location: String,
    email: String,
    phone: Number,
    password: String,
    allowance: Number
})

const userOperation = mongoose.model("usertable", userSchema)

const PORT = 5000
const verifyToken=(req,res,next)=>{
    if(req.headers && 
       req.headers.authorization)
    {
        jwt.verify(req.headers.authorization,secretKey,async (err, decode)=>{
            if(err) 
            {
                req.user=undefined;
                res.status(401).send("Token has expired")
            }
            else{
                next()
            }
        })
    }
    else{
        res.status(401).send("Invalid authentication")
    }
}

app.get('/',verifyToken, (request, response) => {
    response.send("You just arrived on TechOrigin Backend, Welcome Mr. Ifeanyi")
})

//localhost:5000/fetch?email=<email>
app.get("/fetch",verifyToken, (req, res) => {
    const { email } = req.query
    res.send("All data has been fetched for " + email)
})
app.get("/loginByAuth", async (req, res) => {
    const { email, password } = req.query
    const user = await userOperation.findOne({ email: email })
    if (user != null) {
        const isPasswordOkay = bcrypt.compareSync(
            password,
            user.password
        )
        if (isPasswordOkay) {
            const token = jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
                ,
                secretKey
                ,
                {
                    expiresIn:30
                }
                )
            res.send({
                accessToken:token,
                message: "Access Granted"
            })
        }
        else {
            res.send("Invalid Password")
        }
    }
    else {
        res.send("Invalid User email")
    }
})

//localhost:5000/login?email=<email>&password=<password>
app.get("/login", (req, res) => {
    const { email, password } = req.query
    if (email == "oniro@gmail.com" && password == "12345") {
        res.send("Login was successful")
    }
    else {
        res.send("Invalid login credentials")
    }
})

//localhost:5000/create
app.post("/create", (req, res) => {
    res.send("User created successfully")
})

//localhost:5000/createbyname?firstname=<fname>&lastname=<lname>
app.post("/createbyname", (req, res) => {
    const { firstname, lastname } = req.query
    // res.send("Hello "+firstname+" "+lastname+", your account has been created successfully")
    res.send(`Hello ${firstname} ${lastname}, your account has been created successfully`)
})

//localhost:5000/createuser
app.post('/createuser', (req, res) => {
    const userData = req.body
    userData.password = bcrypt.hashSync(userData.password, 8)
    userOperation.create(userData)
    res.send(`Firstname: ${userData.firstname} Lastname: ${userData.lastname}`)
})

//localhost:5000/createuserbyquery
app.post('/createuserbyquery', async (req, res) => {
    const { firstname, lastname, gender } = req.query
    await userOperation.create({
        firstname: firstname,
        lastname: lastname,
        gender: gender
    })
    res.send(`Welcome to TechOriginDB ${firstname}`)
})

//localhost:5000/getallusers
app.get('/getallusers',verifyToken, async (req, res) => {
    const allUsers = await userOperation.find()
    res.send(allUsers)
})

//localhost:5000/getuserbyfirstname
app.get('/getuserbyfirstname', async (req, res) => {
    const { firstname } = req.query
    const user = await userOperation.findOne(
        {
            firstname: firstname
        }
    )
    res.send(user)
})

//localhost:5000/getuserbygender
app.get('/getuserbygender', async (req, res) => {
    const { gender } = req.query
    const user = await userOperation.find(
        {
            gender: gender
        }
    )
    res.send(user)
})

//localhost:5000/updateuser
app.put("/updateuser", async (req, res) => {
    const userData = req.body
    // await userOperation.updateOne({firstname:userData.firstname},userData)
    await userOperation.updateOne({ firstname: userData.firstname }, { $set: userData })
    res.send(`Update for ${userData.firstname} was successful`)
})

//localhost:5000/updateuseremail
app.put("/updateuseremail", async (req, res) => {
    const userData = req.body
    await userOperation.updateOne({ firstname: userData.firstname },
        {
            $set: { email: userData.email }
        })
    res.send(`Update for ${userData.firstname} was successful`)
})

//localhost:5000/addallowancebygender
app.put("/addallowancebygender", async (req, res) => {
    const { gender, allowance } = req.query
    await userOperation.updateMany({ gender: gender },
        {
            $set: { allowance: allowance }
        })
    res.send(`Update was successful`)
})

//localhost:5000/deleteuser
app.delete("/deleteuser", async (req, res) => {
    const { email } = req.query
    await userOperation.deleteOne({ email: email })
    res.send('Account deleted successfully')
})
//localhost:5000/deleteuserbygender
app.delete("/deleteuserbygender", async (req, res) => {
    const { gender } = req.query
    await userOperation.deleteMany({ gender: gender })
    res.send('Accounts deleted successfully')
})


app.listen(PORT, (errorMessage) => {
    if (errorMessage) {
        console.log("Error Occurred while connecting to server")
    }
    else {
        console.log("Server is running on PORT: " + PORT)
    }
})

//CRUD
//C - Create
//R - Read
//U - Update
//D - Delete

//MEVN - MongoDB ExpressJS VueJS NodeJS