const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//used to Verify if email already exists in the database
const emailCheck = function (email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};
const getUser = function (email, password, users) {
  for (const user in users) {
    if (email === users[user].email && password === users[user].password) {
      return users[user];
    }
  }
  return false;
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//holds the "Long" URLS
const urlDatabase = {
  "9sm5xK": "http://www.google.com",
  b2xVn2: "http://www.lighthouselabs.ca",
};

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") return res.send(400);

  if (emailCheck(email, users)) return res.send(400);

  const user = {
    user_id,
    email,
    password,
  };
  users[user_id] = user;

  res.cookie("user_id", user_id);
  res.redirect("/urls");
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
    username: req.cookies["user_id"],
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
  const email = req.body.email;
  const password = req.body.password;
  //console.log(`email: ${email}, Password ${password}`);
  if (email === "" || password === "") return res.send(400);

  const validUser = getUser(email, password, users);
  //console.log(`Valid user`, validUser);
  if (!validUser) {
    return res.send("Invalid credentials");
  }

  res.cookie("user_id", validUser["id"]);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
