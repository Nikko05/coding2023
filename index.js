const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")



app.set('view-engine', 'ejs')
app.use(cookieParser())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
  res.render('register.ejs')
})

const connection = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: '-1GHde2Ad5C3gfBA-Ga22ddB1gBfhE5e',
    database: 'railway',
    port: 45362
});

app.listen(port, () => {

})
