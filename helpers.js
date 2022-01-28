//used to Verify if email already exists in the database
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

module.exports = { emailCheck, getUser };
