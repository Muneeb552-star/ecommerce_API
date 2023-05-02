const router = require('express').Router()
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')

//Get All Orders
router.get('/', async (req, res) => {
  try {
    const order = await Order.find()
      .populate('user', 'name')
      .sort({ dateOrdered: -1 })
    order
      ? res.status(200).json(order)
      : res.status(404).json('No record in database')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Get Order By ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' }
      })
    order
      ? res.status(200).json(order)
      : res.status(404).json('Order does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Add Order
router.post('/', async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async orderItem => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product
      })
      newOrderItem = await newOrderItem.save()
      return newOrderItem._id
    })
  )
  const orderItemsIdsResolved = await orderItemsIds

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async orderItemId => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      )
      const totalPrice = orderItem.product.price * orderItem.quantity
      return totalPrice
    })
  )
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user
  })

  try {
    order = await order.save()
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json(error)
  }
})

// UPDATE ORDER
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      { new: true }
    )
    updatedOrder
      ? res.status(200).json(updatedOrder)
      : res.status(404).json('Order with this id does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

//DELETE ORDER
router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async order => {
      return order
        ? (await Promise.all(
            order.orderItems.map(async orderItem => {
              await OrderItem.findByIdAndRemove(orderItem)
            })
          ),
          res
            .status(200)
            .json({ success: true, message: 'Order deleted successfully!' }))
        : res.status(404).json({ success: false, message: 'order not found!' })
    })
    .catch(err => {
      return res.status(500).json({ success: false, error: err })
    })
})

//Get total Sales
router.get('/get/totalsales', async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])
    totalSales
      ? res.status(200).json(totalSales)
      : res.status(404).json('The order sales cannot be generated')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Get User Order by User Id
router.get('/get/count', async (req, res) => {
  try {
    const orderCount = await Order.countDocuments(count => count)
    orderCount
      ? res.status(200).json({
          orderCount: orderCount
        })
      : res.status(404).json('0 orders')
  } catch (error) {
    res.status(500).json(error)
  }
})
//Get total Order Count
router.get('/get/userorders/:userid', async (req, res) => {
  try {
    const orderCount = await Order.countDocuments(count => count)
    orderCount
      ? res.status(200).json({
          orderCount: orderCount
        })
      : res.status(404).json('0 orders')
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router
