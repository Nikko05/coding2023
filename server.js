const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});

app.post('/purchase', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          name: 'Product Name',
          description: 'Product Description',
          amount: 0, // Amount in cents
          currency: 'pln',
          quantity: 1,
        },
      ],
      success_url: `${req.get('origin')}/success`,
      cancel_url: `${req.get('origin')}/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
