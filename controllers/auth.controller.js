const sequelize = require("../database/sequelize-initializer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const login = async function (req, res) {
  try {
    if (req.session.user) {
      res.send({ username: req.session.user.username });
      return;
    }
    if (req.body.username === undefined || req.body.password === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (user) {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match && user.activated) {
        req.session.user = user;
        res.send({ username: user.username });
      } else if (!user.activated) {
        res.status(401).send("User not activated");
      } else {
        res.status(401).send("Incorrect password");
      }
    } else {
      res.status(404).send("User with that username does not exist");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const getLoggedUser = async function (req, res) {
  try {
    if (req.session.user) {
      res.send({
        username: req.session.user.username,
        email: req.session.user.email,
        image: req.session.user.image,
      });
    } else {
      res.status(401).send("Not logged in");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const logout = async function (req, res) {
  try {
    if (!req.session) {
      res.status(400).send("Bad request");
      return;
    }
    if (!req.session.user) {
      res.status(401).send("Not logged in");
      return;
    }
    req.session.destroy();
    res.send("Logged out");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const register = async function (req, res) {
  try {
    if (
      req.body.username === undefined ||
      req.body.email === undefined ||
      req.body.password === undefined
    ) {
      res.status(400).send("Bad request");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) {
      res.status(409).send("User with that email already exists");
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      const newUser = await sequelize.models.User.create({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        activation_token: crypto.randomBytes(32).toString("hex"),
      });
      res.send(newUser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const activate = async function (req, res) {
  try {
    if (req.params.username === undefined || req.params.token === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        username: req.params.username,
        activation_token: req.params.token,
      },
    });

    if (user) {
      user.activated = true;
      user.activation_token = null;
      await user.save();
      res.redirect("/");
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const sendActivationEmail = async function (req, res) {
  try {
    if (req.body.email === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    if (
      req.session.lastSentTimestamp &&
      Date.now() - req.session.lastSentTimestamp < 60000
    ) {
      res.status(429).send("Too many requests, please wait 30s");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: `Quizz World <process.env.EMAIL_USERNAME>`,
        to: user.email,
        subject: "Account activation",
        text: `Hello ${user.username},\n\nPlease activate your account by clicking the following link:\n\n${process.env.SITE_ADDRESS}/auth/activate/${user.username}/${user.activation_token}`,
        html: require("../email-templates/confirm-email-message")(user),
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      req.session.lastSentTimestamp = Date.now();
      res.send("Email sent");
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const sendPasswordResetEmail = async function (req, res) {
  try {
    if (req.body.email === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: "Password reset",
        text: `Hello ${user.username},\n\nPlease reset your password by clicking the following link:\n\n${process.env.SITE_ADDRESS}/auth/reset-password/${user.username}/${user.activation_token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.send("Email sent");
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const resetPassword = async function (req, res) {
  try {
    if (
      req.params.username === undefined ||
      req.params.token === undefined ||
      req.body.password === undefined
    ) {
      res.status(400).send("Bad request");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        username: req.params.username,
        activation_token: req.params.token,
      },
    });

    if (user) {
      const hash = await bcrypt.hash(req.body.password, 10);
      user.password = hash;
      user.activation_token = null;
      await user.save();
      res.send("Password reset");
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const changeLoggedUserUsername = async function (req, res) {
  try {
    if (req.body.username === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    if (req.session.user === undefined) {
      res.status(401).send("Unauthorized");
      return;
    }
    if (
      await sequelize.models.User.findOne({
        where: {
          username: req.body.username,
        },
      })
    ) {
      res.status(409).send("Username already exists");
      return;
    }
    sequelize.models.User.update(
      {
        username: req.body.username,
      },
      {
        where: {
          id: req.session.user.id,
        },
      }
    ).then((user) => {
      req.session.user.username = req.body.username;
      res.send(user);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const changePassword = async function (req, res) {
  try {
    if (
      req.body.oldPassword === undefined ||
      req.body.newPassword === undefined ||
      req.body.repeatNewPassword === undefined
    ) {
      res.status(400).send("Bad request");
      return;
    }
    if (req.body.newPassword !== req.body.repeatNewPassword) {
      res.status(400).send("Passwords do not match");
      return;
    }
    if (req.session.user === undefined) {
      res.status(401).send("Unauthorized");
      return;
    }
    const user = await sequelize.models.User.findOne({
      where: {
        id: req.session.user.id,
      },
    });
    if (await bcrypt.compare(req.body.oldPassword, user.password)) {
      const hash = await bcrypt.hash(req.body.newPassword, 10);
      user.password = hash;
      await user.save();
      res.send("Password changed");
    } else {
      res.status(401).send("Incorrect password");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  login,
  logout,
  register,
  activate,
  sendActivationEmail,
  sendPasswordResetEmail,
  resetPassword,
  getLoggedUser,
  changeLoggedUserUsername,
  changePassword,
};
