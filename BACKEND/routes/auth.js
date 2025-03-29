const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Harryisagoodb$oy';


// A Promise doesn't directly return true or false. Instead, it represents the result of an asynchronous operation — which could be:

// ✅ Success (Resolved) → Returns the result through .then()
// ❌ Failure (Rejected) → Returns the error through .catch()


// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
//[] is expreess-validator// this is a package to find an error like thing or  condition
// if this give an errorr
//user see the message like that 
// "errors":[
//   {
//     "value":"Enter a valid name",
//     "msg":"Enter a valid email".
//      "location":name;
//   }
// ]
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

  let success = false;

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });//this is promise if we do not use await does not get proper result
    if (user) {
      return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
    }


    ///this salt was random with same password also
    // password store in hashes(password+salt)
    // Password: "password123"
      // Salt (random): "abc123"
      // Hash 1: "$2b$10$abc123hashedoutput1"
       
      // Bcrypt stores the salt inside the hash itself. When verifying, bcrypt extracts the salt from the hash, rehashes the input password with that salt, and compares the results.
      // This makes bcrypt highly secure against rainbow table and brute-force attacks.\
     
     
      // const bcrypt = require('bcrypt');
      // const salt = bcrypt.genSaltSync(10);
      // const hash1 = bcrypt.hashSync('password123', salt);
      // const hash2 = bcrypt.hashSync('password123', salt);
      // console.log(hash1 === hash2); // true (Same salt used)



    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });
    const data = {
      user: {
        id: user.id
      }
    }

// jwt is sync process so you did not write await 

// ✅ If someone steals your JWT → They CAN access your site until the token expires.

// 🚫 But with proper security (like short expiration and refresh tokens), you can reduce the risk.

// Would you like me to show how to implement Refresh Tokens with JWT in Node.js?

    const authtoken = jwt.sign(data, JWT_SECRET);


    // res.json(user)
    success=true; 
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

  let success = false;

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success=false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser,  async (req, res) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
module.exports = router