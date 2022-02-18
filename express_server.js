//REQUIRMENTS
const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { generateRandomString } = require("./helpers");
const { emailCheck } = require("./helpers");
const { getUser } = require("./helpers");
const { getURLSForUser } = require("./helpers");
const { urlDatabase } = require("./helpers");

//MIDDLEWARE & SERVER SETTINGS

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["Key1", "Key2"],
  })
);

app.set("view engine", "ejs");

//holds the "Long" URLS
// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW",
//   },
// };

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ROUTE HANDLERS

app.get("/", (req, res) => {
  //cookie validation
  const { user_id } = req.session;

  //user validation
  const validUser = users[user_id];
  if (validUser) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("urls_login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// VIEWS ROUTS

app.get("/register", (req, res) => {
  //cookie validation
  const { user_id } = req.session;

  //user validation
  const validUser = users[user_id];
  if (validUser) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  //cookie validation
  const { user_id } = req.session;

  //user validation
  const validUser = users[user_id];
  if (validUser) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (!user_id) {
    res.status(400).send("No user logged in");

    // return res.redirect("/login");
  }

  //user validation
  const validUser = users[user_id];
  if (!validUser) {
    return res.redirect("/login");
  }

  const urls = getURLSForUser(user_id);

  const templateVars = {
    user: validUser,
    urls: urls,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  //user validation
  const validUser = users[user_id];
  if (!validUser) {
    return res.redirect("/login");
  }

  //goal
  const templateVars = {
    user: validUser,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (!user_id) {
    res.status(400).send("No user logged in");
    //return res.redirect("/login");
  }

  //user validation
  const validUser = users[user_id];
  if (!validUser) {
    return res.redirect("/login");
  }

  const { shortURL } = req.params;
  const validURL = urlDatabase[shortURL];
  if (!validURL) {
    return res.status(400).send("URL does not exist");
  }

  const templateVars = {
    user: validUser,
    shortURL: shortURL,
    longURL: validURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params.shortURL;
  const validURL = urlDatabase[shortURL];
  if (!validURL) {
    return res.status(400).send("URL does not exist");
  }
  res.redirect(validURL);
});

//API AUTH ROUTES

app.post("/register", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }

  //Input Validation
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please enter a valid email/password");
  }

  //Email Validation
  const emailExists = emailCheck(email, users);
  if (emailExists) {
    return res.status(400).send("This email is already registered");
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }

  //Input Validation
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please enter a valid email/password");
  }

  //User Credentials Validation
  const validUser = getUser(email, password, users);
  if (!validUser) {
    return res.send("Invalid credentials");
  }

  req.session.user_id = validUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//API URLS ROUTES

app.post("/urls", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  //user validation
  const validUser = users[user_id];
  if (!validUser) {
    return res.redirect("/login");
  }

  // Input Validation
  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("Please enter a valid longURL");
  }

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: validUser.id,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  //user validation
  const validUser = users[user_id];
  if (!validUser) {
    return res.redirect("/login");
  }

  const { shortURL } = req.params;

  const urlObj = urlDatabase[shortURL];

  if (!urlObj) {
    return res.status(400).send("Url does not exist");
  }

  const urlBelongsToUser = urlObj.userID === validUser.id;
  if (!urlBelongsToUser) {
    return res.status(400).send("Url does not belong to user");
  }

  // Input Validation
  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("Please enter a valid longURL");
  }

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: validUser.id,
  };

  res.redirect("/urls");
});

// Deletes a short url and its long url counterpart
app.post("/urls/:shortURL/delete", (req, res) => {
  //cookie validation
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  //user validation
  const validUser = users[user_id];
  if (!validUser) {
    return res.redirect("/login");
  }

  const { shortURL } = req.params;

  const urlObj = urlDatabase[shortURL];

  const urlBelongsToUser = urlObj.userID === validUser.id;
  if (!urlBelongsToUser) {
    return res.status(400).send("Url does not belong to user");
  }

  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

// LISTENER

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
