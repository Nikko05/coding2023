const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
app.set('view-engine', 'ejs')
app.use(cookieParser())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')));

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.get('/profile', (req, res) => {
  res.render('profile.ejs')
})

app.post('/register')

const connection = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: '-1GHde2Ad5C3gfBA-Ga22ddB1gBfhE5e',
    database: 'railway',
    port: 45362
});

app.listen(port, () => {

})