const bcrypt = require("bcryptjs"); // npm i bcryptjs

const router = require("express").Router();

const Users = require("../users/users-model.js");

router.post("/register", (req, res) => {
  // let userInformation = req.body;

  // bcrypt.hash(userInformation.password, 12, (err, hashedPassword) => {
  //   userInformation.password = hashedPassword;

  //   Users.add(userInformation)
  //     .then(saved => {
  //       req.session.username = saved.username; // <<<<<<<<<<<<<<
  //       res.status(201).json(saved);
  //     })
  //     .catch(error => {
  //       res.status(500).json(error);
  //     });
  // });
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      req.session.username = saved.username; // <<<<<<<<<<<<<<
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // check that the password is valid
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "'You shall not pass!'" });
      }
    })
    .catch(error => {
      console.log("login error", error);
      res.status(500).json(error);
    });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.json({
          message:
            "you can checkout any time you like, but you can never leave!"
        });
      } else {
        res.status(200).json({ message: "bye, thanks for playing!" });
      }
    });
  } else {
    res.status(200).json({ message: "You were never here to begin with" });
  }
});

module.exports = router;
