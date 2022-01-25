const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // Log the POST request body to the console
  //   let key = generateRandomString(6); // generates random string to be used as the shortURL
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL };

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
