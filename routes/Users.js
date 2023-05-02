const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndLogin
} = require('./verifyToken')

//Add User
router.post('/', verifyTokenAndAdmin, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    color: req.body.color,
    password: await bcrypt.hash(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country
  })

  try {
    user = await user.save()
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
})

//Get All Users
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    users
      ? res.status(200).json(users)
      : res.status(404).json('No record in database')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Get User By ID
router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    user
      ? res.status(200).json(user)
      : res.status(404).json('User does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

// DELETE USER
router.delete('/:id', async (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(user => {
      if (user)
        return res
          .status(200)
          .json({ success: true, message: 'User deleted successfully' })
      else
        return res
          .status(404)
          .json({ success: false, message: 'User does not exist' })
    })
    .catch(err => {
      return res.status(500).json({ success: false, error: err })
    })
})

//User Login
router.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ message: 'Email and password are required' })
    return
  }

  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      res.status(401).json({ message: 'User with this email does not exist!' })
      return
    }

    const passwordsMatch = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!passwordsMatch) {
      res.status(401).json({ message: 'Wrong Credentials' })
      return
    }

    //Creating our JWT
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: '3d' }
    )

    //Setting the accessToken value in Cookies
    res.cookie('token', accessToken, { httpOnly: true })

    const { password, ...others } = user._doc

    res.status(200).json({ ...others, accessToken })
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET USERS COUNT
router.get('/get/count', async (req, res) => {
  try {
    const userCount = await User.find().count()
    userCount
      ? res.status(200).json({ userCount: userCount })
      : res.status(404).json('User record is empty')
  } catch (error) {
    res.status(500).json(error)
  }
})

// Logout route to clear the cookie containing the JWT token
router.post('/logout', (req, res) => {
  try {
    req.cookies.token
      ? (res.clearCookie('token'),
        res.status(200).json('Logged out successfully!'))
      : res.status(400).json('Cookie is not set')
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router
