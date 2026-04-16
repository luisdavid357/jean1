require('dotenv').config();

const express = require('express');
const { WebpayPlus } = require('transbank-sdk');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

WebpayPlus.configureForProduction(
  '597053073162',
  'TU_API_KEY'
);

// Crear pago
app.post('/crear-pago', async (req, res) => {

  const cart = req.body.cart;

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
  });

  try {
    const response = await new WebpayPlus.Transaction().create(
      'orden_' + Date.now(),
      'sesion123',
      total,
      'http://jeanfood.cl'
    );

    res.json(response);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirmar pago
app.post('/retorno', async (req, res) => {

  const token = req.body.token_ws;

  try {
    const response = await new WebpayPlus.Transaction().commit(token);

    if (response.status === 'AUTHORIZED') {
      res.send("<h1>✅ Pago aprobado</h1>");
    } else {
      res.send("<h1>❌ Pago rechazado</h1>");
    }

  } catch (error) {
    res.send("Error en el pago");
  }
});

app.listen(5500, () => {
  console.log('Servidor en http://jeanfood.cl:5500
    ');
});