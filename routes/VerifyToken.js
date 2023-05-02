const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token
  //Verify Token if exist
  if (token) {
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        res
          .status(401)
          .json({ message: 'Access denied, invalid authorization token' })
        return
      }
      req.user = user
      next()
    })
  } else {
    res
      .status(401)
      .json({ message: 'Access denied, authorization token missing' })
    return
  }
}

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next()
    } else {
      res.status(403).json('You are not allowed to do that!')
    }
  })
}

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next()
    } else {
      res.status(403).json('You are not allowed to do that!')
    }
  })
}

const verifyTokenAndLogin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      res.status(403).json('You are already logged in!')
    } else {
      next()
    }
  })
}

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndLogin
}
