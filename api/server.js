const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const KnexSessionStorage = require("connect-session-knex")(session); // <<<<<< for storing sessions in db

const apiRouter = require("./api-router.js");
const configureMiddleware = require("./configure-middleware.js");
const knexConnection = require("../database/dbConfig.js");

const server = express();

const sessionConfig = {
  name: "monkey", //
  secret: process.env.COOKIE_SECRET || "keep it secret, keep it safe!",
  cookie: {
    maxAge: 1000 * 60 * 60, // valid for 1 hour (in milliseconds)
    secure: process.env.NODE_ENV === "development" ? false : true, // do we send cookie over https only?
    httpOnly: true // prevent client javascript code from accessing the cookie
  },
  resave: false,
  saveUninitialized: true, // GDPR laws against setting cookies automatically
  store: new KnexSessionStorage({
    knex: knexConnection,
    clearInterval: 1000 * 60 * 10, // delete expired sessions every 10 minutes
    tablename: "user_sessions",
    sidfieldname: "id",
    createtable: true
  })
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

configureMiddleware(server);

server.use("/api", apiRouter);

server.get("/", (req, res) => {
  res.json({ api: "up", session: req.session });
});

module.exports = server;
