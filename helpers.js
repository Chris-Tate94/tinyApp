//used to Verify if email already exists in the database

const bcrypt = require("bcryptjs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const emailCheck = function (email, db) {
  for (const user in db) {
    if (email === db[user].email) {
      return true;
    }
  }
  return false;
};

const getUser = function (email, password, db) {
  for (const user in db) {
    const emailExists = email === db[user].email;
    const passwordMatch = bcrypt.compareSync(password, db[user].password);
    if (emailExists && passwordMatch) {
      return db[user];
    }
  }
  return null;
};
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const getURLSForUser = function (userId) {
  const output = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      output[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return output;
};

module.exports = {
  emailCheck,
  getUser,
  generateRandomString,
  getURLSForUser,
  urlDatabase,
};
