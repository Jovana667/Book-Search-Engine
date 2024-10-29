const mongoose = require("mongoose");
const db = require("../config/connection");
const { User } = require("../models");

const userSeeds = [
  {
    username: "testuser",
    email: "test@test.com",
    password: "password12345",
    savedBooks: [],
  },
];

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    console.log("Users cleared");

    await User.create(userSeeds);
    console.log("Users seeded");

    console.log("All data seeded!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

db.once("open", () => {
  seedDatabase();
});
