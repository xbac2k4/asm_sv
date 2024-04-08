var nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ngoxuanbac2k4@gmail.com",
        pass: "l z b q j a z z l z g k l s q x"
    }
});
module.exports = transporter 