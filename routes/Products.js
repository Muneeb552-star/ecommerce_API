const router = require('express').Router()
const Product = require('../models/Product')
const Category = require('../models/Category')
const mongoose = require('mongoose')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let uploadError = new Error('invalid image type')

    if (isValid) {
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

//Add Product
router.post('/', uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category)
  if (!category) return res.status(400).send('Invalid Category')

  const file = req.file
  if (!file) return res.status(400).send('No image in the request')

  const fileName = file.filename
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured
  })
  try {
    product = await product.save()
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET Single PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category')
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json(error)
  }
})

//Get ALL Products
router.get('/', async (req, res) => {
  // localhost:3000/api/v1/products?categories=2342342,234234
  let filter = {}
  if (req.query.categories)
    filter = { category: req.query.categories.split(',') }
  try {
    const productList = await Product.find(filter).populate('category')
    if (productList) res.status(200).json(productList)
    res.status(404).json('Product with these categories does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

// UPDATE PRODUCT
router.put('/:id', async (req, res) => {
  if (req.body.category) {
    const category = await Category.findById(req.body.category)
    if (!category) res.status(404).json('Invalid Category')
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
      },
      { new: true }
    )
    res.status(200).json(updatedProduct)
  } catch (error) {
    res.status(500).json(error)
  }
})

// DELETE PRODUCT
router.delete('/:id', async (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then(product => {
      if (product)
        return res
          .status(200)
          .json({ success: true, message: 'Product deleted successfully' })
      else
        return res
          .status(404)
          .json({ success: false, message: 'Product does not exist' })
    })
    .catch(err => {
      return res.status(500).json({ success: false, error: err })
    })
})

// GET PRODUCT COUNT
router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.find().count()
    res.status(200).json({ productCount: productCount })
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET FEATURED PRODUCT COUNT
router.get('/get/featured/:count', async (req, res) => {
  try {
    const count = req.params.count ? req.params.count : 0
    const featuredProducts = await Product.find({ isFeatured: true }).limit(
      +count
    )
    res.status(200).json(featuredProducts)
  } catch (error) {
    res.status(500).json(error)
  }
})

//Update Product Images
router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid Product Id')
    }
    const files = req.files
    let imagesPaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    if (files) {
      files.map(file => {
        imagesPaths.push(`${basePath}${file.filename}`)
      })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths
      },
      { new: true }
    )

    if (!product) return res.status(500).send('the gallery cannot be updated!')

    res.send(product)
  }
)
module.exports = router
