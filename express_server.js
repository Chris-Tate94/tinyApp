const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//holds the "Long" URLS
const urlDatabase = {
  "9sm5xK": "http://www.google.com",
  b2xVn2: "http://www.lighthouselabs.ca",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  // generates random string to be used as the shortURL
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  if (longURL === "") {
    return res.send("Please enter a valid URL");
  }
  urlDatabase[shortURL] = longURL;

  const templateVars = {
    username: req.cookies["username"],
    shortURL: shortURL,
    longURL: longURL,
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// Deletes a short url and its long url counterpart
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //gets the req.body.username from the header.ejs form to log in
  const signinID = req.body.username;
  //use signin ID to set the cookie as the username
  res.cookie("username", signinID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
