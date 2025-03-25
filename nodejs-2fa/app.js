const express = require("express");
const {authenticator} = require("otplib");
const qrcode = require("qrcode");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

// generate a secret key for the user
const generateSecret = () => authenticator.generateSecret();

// generate OTP for the user
const generateOTP = secret => authenticator.generate(secret);

// verify the OTP entered by the user
const verifyOTP = (secret, token) => authenticator.verify({ secret, token });

const generateQRCode = async (secret) => {
  const otpAuthURL = authenticator.keyuri("user@example.com", "nodejs-2fa", secret);

  try {
    const qrImage = await qrcode.toDataURL(otpAuthURL);

    return qrImage;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
}

app.get("/", async (req, res) => {

  const secret = generateSecret();

  const qrcode = await generateQRCode(secret);

  res.render("index", { secret, qrcode });
})

app.post("/verify", (req, res) => {
  const { secret, token } = req.body;

  const isValid = verifyOTP(secret, token);

  res.render("result", { isValid });
})

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
