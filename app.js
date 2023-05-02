const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const app = express()
require('dotenv').config()

//ROUTES
const productsRoute = require('./routes/Products')
const categoriesRoute = require('./routes/Categories')
const usersRoute = require('./routes/Users')
const ordersRoute = require('./routes/Orders')

//.env variables
const PORT = process.env.PORT || 5000
const api = process.env.API_URL

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('DATABASE Connected Successfully'))
  .catch(err => console.log(err))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('tiny'))
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

app.use(`${api}/products`, productsRoute)
app.use(`${api}/categories`, categoriesRoute)
app.use(`${api}/users`, usersRoute)
app.use(`${api}/orders`, ordersRoute)


app.listen(PORT, () => {
  console.log(`Server Started at http://127.0.0.1:${PORT}`)
})
