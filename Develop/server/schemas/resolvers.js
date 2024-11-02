const { GraphQLError } = require("graphql");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log("ME QUERY - Context:", context);
      try {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id });
          console.log("ME QUERY - Found user data:", userData);
          return userData;
        }
        console.log("ME QUERY - No user in context");
        throw new GraphQLError("Not logged in", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      } catch (err) {
        console.error("ME QUERY - Error:", err);
        throw err;
      }
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      try {
        console.log("Login attempt for email:", email);
        const user = await User.findOne({ email });

        if (!user) {
          console.log("No user found with email:", email);
          throw new GraphQLError("No user found with this email address", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const correctPw = await user.isCorrectPassword(password);
        console.log("Password correct:", correctPw);

        if (!correctPw) {
          throw new GraphQLError("Incorrect credentials", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const token = signToken(user);
        console.log("Login successful, token generated");
        return { token, user };
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      }
    },

    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.error("Error creating user:", err);
        throw new GraphQLError("Failed to create user", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    },

    saveBook: async (parent, { bookData }, context) => {
      console.log("SAVE BOOK - Attempting to save:", {
        bookData,
        user: context.user,
      });
      try {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: bookData } },
            { new: true }
          );
          console.log("SAVE BOOK - Updated user:", updatedUser);
          return updatedUser;
        }
        console.log("SAVE BOOK - No user in context");
        throw new GraphQLError("Not logged in", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      } catch (err) {
        console.error("SAVE BOOK - Error:", err);
        throw err;
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      try {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
          return updatedUser;
        }
        throw new GraphQLError("You need to be logged in!", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      } catch (err) {
        console.error("Error removing book:", err);
        throw new GraphQLError("Failed to remove book", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    },
  },
};

module.exports = resolvers;
