const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const fetch = require("node-fetch")
const cookieParser = require("cookie-parser")
const crypto = require("crypto")
const { text } = require('body-parser')
const axios = require("axios")

app.set('view-engine', 'ejs')
app.use(cookieParser())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const connection = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: '',
    database: 'railway',
    port: 45362
});

app.listen(port, () => {

})

app.get("/register", (req,res)=>{
    res.render("register.ejs")
})