const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const stripe = require('stripe')('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');

app.set('view-engine', 'ejs')
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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


app.get('/donations', (req, res) => {
  res.render('donations.ejs', { stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});









app.get('/', (req, res) => {
    res.render('paymentForm');
});

app.post('/processPayment', async (req, res) => {
    const { price, currency, stripeToken } = req.body;

    try {
        const charge = await stripe.charges.create({
            amount: price * 100, // Zamień cenę na centy (Stripe używa wartości w centach)
            currency: currency,
            source: stripeToken,
            description: 'Opis transakcji'
        });

        // Tutaj możesz dodać kod obsługujący udaną transakcję

        res.send('Płatność udana!');
    } catch (error) {
        console.error(error);
        res.send('Wystąpił błąd podczas przetwarzania płatności.');
    }
});

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
