const express = require("express");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch'); // storage directory

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  // login
  const userData = await fetch('http://localhost:3000/authentication/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'maria@email.com',
      password: 'guess',
    })
  })

  if (!userData.ok) {
    throw new Error('Network response was not ok to login');
  }

  const user = await userData.json();
  // Storing data
  localStorage.setItem('access_token', user.access_token);

  // generate qrcode
  const response = await fetch('http://localhost:3000/authentication/2fa/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.access_token}`,
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  const secret = data.secret;
  const qrcode = data.qrcode;

  res.render("index", { secret, qrcode });
})

app.post("/verify", async (req, res) => {
  const { secret, token } = req.body;

  // Retrieving data
  const access_token = localStorage.getItem('access_token');

  const response = await fetch('http://localhost:3000/authentication/2fa/turn-on', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      twoFactorAuthenticationCode: token,
      secret: secret // do not send secret via http on production
    })
  });

  const data = await response.json();

  const isValid = data.isValid

  // Removing data
  localStorage.removeItem('access_token');

  res.render("result", { isValid });
})

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
