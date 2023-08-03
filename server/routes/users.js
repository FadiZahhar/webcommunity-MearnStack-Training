const router = require("express").Router();

// import the mongo User model
const User = require("../models/User.js");

// import bcrypt for encrypting the password
const bcrypt = require("bcryptjs");

// import config and jwt for getting a token for security
const jwt = require("jsonwebtoken");
const config = require("config");

// import data validators from express
const { check, validationResult } = require("express-validator");

// use auth middleware to authenticate the user when asking for his info
const auth = require("../middleware/auth.js");

/*
 * in order to use the authentication middleware, you will pass it as a callback
 * to the route you want to protect before the route handling function
 *
 * reviewing the middleware/auth.js, user info should be attached to the request
 * object. so, easily take them with req.user and manipulate them
 */

// @route   GET api/auth
// @desc    GET the logged in user
// @access  Private
router.get("/", auth, async (req, response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    response.json(user);
  } catch (err) {
    console.error(err);
    response.status(500).send("Server error");
  }
});




// check input fields and sanitize them before handling the request
let validInputs = [
  check("name", "Name is required to create an account").isLength({ max: 30 }).not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Please include a password with minimum 8 chars").isLength({ min: 8 }),
];

// @route POST api/user
// @desc  REGISTER a new user
// @access Public
router.post("/", validInputs, async (req, response) => {
  // now, get the input validation results and store them in a variable
  const errors = validationResult(req);

  // check if there are any errors
  // you can send status code to the client using status() function along with data
  if (!errors.isEmpty())
    return response.status(400).json({ errors: errors.array() });



  // no errors, let's save info in db
  try {
    const { name, email, password } = req.body; // Step-1

    const existUser = await User.findOne({ email }); // Step-2

    if (existUser)
      return response.status(400).json({ msg: "User already exists!" });

    const user = new User({ name, email, password });// Step-3

    // Step-4
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save(); // Step-5



    // now, to validate with jwt
    let payload = { user: { id: user.id } };

    jwt.sign(payload, config.get("jwtSecret"), {
        expiresIn: 86400, // 1 day
      },
      (err, token) => {
        if (err) throw "something went wrong";

        // success message
        response.status(200).json({
          msg: `user registered successfully`,
          token,
        });
      }
    );
  } catch (err) {
    console.error(err);
    response.status(500).json({ msg: "Something is wrong with the server" });
  }
});

/*
 * to use the validators of express:
 * the check is used inside an array given as argument to the router
 * method handler function. depending on how you named the input fields,
 *
 * you validate them using pre-built functions like not(), isEmpty(),
 * isEmail(), isLength({ min: a, max: b}).
 **/

/*
 * summary of steps to save data in db
 *  1) take user input using req.body
 *  2)
 *    a) check if a user with the provided email exists in db
 *    b) if no user exists, return an error 400
 *  3) create a new one using the User model
 *  4) encrypt the password by salting it then hashing it using bcrypt (common security measure)
 *  5) save the user entry to db
 *  6) tell the user that it was registered
 *
 * don't forget to try{...}catch(err){...} for potential errors
 **/
module.exports = router;