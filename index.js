const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql2')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const stripe = require('stripe')('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');
const bcrypt = require("bcrypt")
const axios = require('axios');
require("dotenv").config(); 

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view-engine', 'ejs')
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'roundhouse.proxy.rlwy.net',
  user: 'root',
  password: "-1GHde2Ad5C3gfBA-Ga22ddB1gBfhE5e",
  database: 'railway',
  port: 42881
});

app.get("/dangers",(req,res)=>{
  connection.query('SELECT * FROM dangers', (error, results, fields) => {
    if (error) throw error;

    // Przetwórz wyniki zapytania SELECT
    console.log('Wyniki zapytania SELECT:', results);

    res.json({ results });
    connection.end();
  });
})

app.get('/donations', (req, res) => {
  res.render('donations.ejs');
});


app.get('/map', (req, res) => {
  res.render('map.ejs');
});

app.post('/map', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=538c04b100ed48b39c239f680215c3fd`);
    const formattedData = response.data.results[0].formatted;

    // Przekaz dane w formie JSON jako odpowiedź do klienta
    res.json({ formattedData, latitude, longitude });
  } catch (error) {
    console.error('Błąd zapytania GET:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania danych.', details: error.message });
  }
});




app.get('/grupy', (req, res) => {
    if (req.cookies['user']) {
        var cookie = req.cookies['user']
        connection.query(`SELECT * FROM users WHERE login = '${cookie}'`, function (err, result) {
            if (Object.keys(result).length > 0) {
                if (result[0].id_grupy == null) {
                    res.render('grupy.ejs')
                } else {
                    res.redirect('/grupyCzlonek')
                }
            }
        })
    } else {
        res.redirect('/login')
    }
})

app.get('/grupyCzlonek', (req, res) => {
    if (req.cookies['user']) {
        var wyswietl = "<html><head><title>Twoja grupa</title></head><body>"
        var cookie = req.cookies['user']
        connection.query(`SELECT * FROM users WHERE login = '${cookie}'`, function(err, result, fields) {
            if (Object.keys(result).length > 0) {
                var id_grupy = result[0].id_grupy
                connection.query(`SELECT * FROM users INNER JOIN groupy ON users.id_grupy = groupy.id WHERE users.id_grupy = ${id_grupy}`, function (err, res1, fields) {
                    if (Object.keys(res1).length > 0) {
                        wyswietl += "<p>" + res1[0].nazwa + "</p>"
                        for (var i = 0; i < res1.length; i++) {
                            wyswietl += "<div><p>" + res1[i].imie + " " + res1[i].nazwisko + "</p>" + "<p>" + res1[i].email + "</p></div>"
                        }
                        wyswietl += "</body>"
                        res.send(wyswietl)
                    } else {
                        res.redirect('/grupy')
                    }
                })
            }
        })
    } else {
        res.redirect('login')
    }
})

app.post('/grupy', (req, res) => {
    if (req.cookies['user']) {
        var cookie = req.cookies['user']
        var nazwa = req.body.nazwa
        var id
        connection.query(`SELECT * FROM users WHERE login = '${cookie}'`, function (err, result) {
                if (Object.keys(result).length > 0) {
                    id = result[0].id
                    connection.query(`SELECT * FROM groupy WHERE nazwa = '${nazwa}'`, function (err, res1) {
                        if (Object.keys(res1).length > 0) {
                            var id_grupy = res1[0].id
                            connection.query(`UPDATE users SET id_grupy = ${id_grupy} WHERE login = '${cookie}'`, function (err, res2) {
                                if (err) throw err
                                res.redirect('/')
                            })
                        } else {
                            connection.query(`INSERT INTO groupy (nazwa, id_zalozyciela) VALUES ('${nazwa}', ${id})`, function (err, res1) {
                                connection.query(`SELECT id FROM groupy WHERE nazwa = '${nazwa}' AND id_zalozyciela = ${id}`, function (err, res2) {
                                    if (Object.keys(result).length > 0) {
                                        idG = res2[0].id
                                        connection.query(`UPDATE users SET id_grupy = ${idG} WHERE login = '${cookie}'`, function (err, res3) {
                                            if (err) throw err
                                            res.redirect('/')
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            })
    } else {
        res.redirect('/login')
    }
})



connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
// app.listen(port, () => {
//     console.log(`Serwer działa na http://localhost:${port}`);
// });

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')));

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get('/login', (req, res) => {
  if (req.cookies['user']) {
    res.redirect('/')
  } else {
    res.render('login.ejs')
  }
})

app.post("/register", urlencodedParser, (req, res) => {
  var imie = req.body.imie;
  var nazwisko = req.body.nazwisko;
  var email = req.body.email;
  var login = req.body.login;
  var pass1 = req.body.pass1;
  var pass2 = req.body.pass2;
  var pass;
  var admin = 0;
  connection.query(
    `SELECT id FROM users WHERE login = '${login}';`,
    function (err, result, fields) {
      if (Object.keys(result).length > 0) {
        res.send("Juz istnieje taki uzytkownik");
      } else {
        if (pass1 == pass2) {
          bcrypt.hash(pass1, 10, function (err, hash) {
            connection.query(
              `INSERT INTO users (imie, nazwisko, email, login, haslo, admin) VALUES ('${imie}', '${nazwisko}', '${email}', '${login}', '${hash}', '${admin}');`,
              function (err, result) {
                if (err) throw err;
                res.redirect("/login");
              }
            );
          });
        } else {
          res.send("Hasła się różnią");
        }
      }
    }
  )
})

app.post('/register', urlencodedParser, (req, res) => {
  var imie = req.body.imie
  var nazwisko = req.body.nazwisko
  var email = req.body.email
  var login = req.body.login
  var pass1 = req.body.pass1
  var pass2 = req.body.pass2
  var pass
  var admin = 0
  connection.query(`SELECT id FROM users WHERE login = '${login}';`, function (err, result, fields) {
    if (Object.keys(result).length > 0) {
      res.send('Juz istnieje taki uzytkownik')
    } else {
      if (pass1 == pass2) {
        bcrypt.hash(pass1, 10, function (err, hash) {
          connection.query(`INSERT INTO users (imie, nazwisko, email, login, haslo, admin) VALUES ('${imie}', '${nazwisko}', '${email}', '${login}', '${hash}', '${admin}');`, function (err, result) {
            if (err) throw err
            res.redirect('/login')
          })
        });
      } else {
        res.send("Hasła się różnią")
      }
    }
});
});


app.get('/', (req, res) => {
  /*var cookie
  if (req.cookies['user']) {
    cookie = req.cookies['user']
    var wyswietl = "<html><head><title>Zagrozenia</title></head><body>"
    connection.query(`SELECT * FROM dangers ORDER BY data DESC;`, function (err, result, fields) {
      if (Object.keys(result).length > 0) {
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
  } */
  res.render('index.ejs')
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

app.get("/profile", urlencodedParser, (req, res) => {
  let cookie = req.cookies["user"];

  connection.query(
    `SELECT imie, nazwisko, login, email FROM users WHERE login = '${cookie}'`,
    function (err, result, fields) {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Check if a user was found
      if (result.length > 0) {
        let imie = result[0].imie;
        let nazwisko = result[0].nazwisko;
        let login = result[0].login;
        let email = result[0].email;

        res.render("profile.ejs", {
          imie: imie,
          nazwisko: nazwisko,
          login: login,
          email: email,
        });
      } else {
        // No user found with the given cookie value
        res.status(404).send("User not found");
      }
    }
  );
});


app.post("/profile", urlencodedParser, (req, res)=>{
  let name = req.body.name;
  let surname = req.body.surname;
  let birthDate = req.body.birthDate;
  let bio = req.body.bio;
  let bloodType = req.body.bloodType;

  res.redirect("/");
})

//do wyświertlania
app.get('/report', (req, res) => {
    res.render('reportEvent.ejs')
})

app.listen(port, () => {

});