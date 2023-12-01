const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql2')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")


app.set('view-engine', 'ejs')
app.use(cookieParser())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const connection = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: "-1GHde2Ad5C3gfBA-Ga22ddB1gBfhE5e",
    database: 'railway',
    port: 42881
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')));

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.get('/login', (req, res) => {
    if (req.cookies['user']) {
        res.redirect('/')
    } else {
        res.render('login.ejs')
    }
})

app.post('/register', urlencodedParser, (req,res) => {
    var imie = req.body.imie
    var nazwisko = req.body.nazwisko
    var email = req.body.email
    var login = req.body.login
    var pass1 = req.body.pass1
    var pass2 = req.body.pass2
    var pass
    var admin = 0
    connection.query(`SELECT id FROM users WHERE login = '${login}';`, function (err, result, fields) {
    if (Object.keys(result).length > 0){
        res.send('Juz istnieje taki uzytkownik')
    } else {    
        if (pass1 == pass2) {
            bcrypt.hash(pass1, 10, function(err, hash) {
                connection.query(`INSERT INTO users (imie, nazwisko, email, login, haslo, admin) VALUES ('${imie}', '${nazwisko}', '${email}', '${login}', '${hash}', '${admin}');`, function (err, result) {
                    if (err) throw err
                    res.redirect('/login')
                })
            });
        } else {
            res.send("Hasła się różnią")
        }
    }
    })
})

app.get('/', (req, res) => {
    var cookie
    if (req.cookies['user']) {
        cookie = req.cookies['user']
        var wyswietl = "<html><head><title>Zagrozenia</title></head><body>"
        connection.query(`SELECT * FROM dangers ORDER BY data DESC;`, function(err, result, fields) {
            if (Object.keys(result).length > 0){
                for (var i = 0; i < Object.keys(result).length; i++) {
                    wyswietl += "<div>"
                    wyswietl += "<p>" + result[i].lokacja + "</p>"
                    wyswietl += "<p>" + result[i].data + "</p>"
                    wyswietl += "<p>" + result[i].rodzaj + "</p>"
                    wyswietl += "<p>" + result[i].opis + "</p></div>"
                }
            }
            wyswietl += "</body></html>"
            res.send(wyswietl)
        })
    } else {
        res.redirect('/login')
    }
})

app.post("/login", urlencodedParser, (req, res)=>{
    var login = req.body.login
    var pass = req.body.pass
    connection.connect(function(err) {
        connection.query(`SELECT haslo FROM users WHERE login="${login}"`, function (err, result, fields) {
        if (Object.keys(result).length > 0){
            bcrypt.compare(pass, result[0].haslo, function (err, result) {
                if (result) {
                    console.log(result)
                    res.cookie("user", login)
                    res.redirect("/")
                } else {
                    res.send("Złe hasło")
                }
            })
        } else {
            res.send("Nie ma takiego uzytkownika")
        }
        })
    }
        
    
   )
  })
  app.get('/logout', (req, res) => {
    res.clearCookie('user', {domain: 'localhost'});
    res.redirect('/login')
})


app.listen(port, () => {

})