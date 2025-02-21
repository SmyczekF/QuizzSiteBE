const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/auth.controller.js");

router.post("/login", login);

router.post("/logout", logout);

router.post("/register", register);

router.get("/activate/:username/:token", activate);

router.post("/sendActivationEmail", sendActivationEmail);

router.post("/sendPasswordResetEmail", sendPasswordResetEmail);

router.post("/resetPassword/:username/:token", resetPassword);

router.get("/getLoggedUser", getLoggedUser);

router.post("/changeLoggedUserUsername", changeLoggedUserUsername);

router.post("/changePassword", changePassword);

module.exports = router;
