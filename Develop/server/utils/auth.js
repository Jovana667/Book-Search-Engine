const jwt = require("jsonwebtoken");

// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  // Updated authMiddleware for GraphQL context
  // server/utils/auth.js
  authMiddleware: function ({ req }) {
    console.log("AUTH MIDDLEWARE - Headers:", req.headers);
    let token = req.headers.authorization;

    if (token) {
      token = token.split(" ").pop().trim();
      console.log("AUTH MIDDLEWARE - Parsed token:", token);
    }

    if (!token) {
      console.log("AUTH MIDDLEWARE - No token found");
      return { user: null };
    }

    try {
      const { data } = jwt.verify(token, secret);
      console.log("AUTH MIDDLEWARE - Verified user data:", data);
      return { user: data };
    } catch (err) {
      console.log("AUTH MIDDLEWARE - Token verification failed:", err);
      return { user: null };
    }
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
