const router = require('express').Router()
const Category = require('../models/Category')

//Get All Categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().select('-password')
    categories
      ? res.status(200).json(categories)
      : res.status(404).json('No record in database')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Get Category By ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    category
      ? res.status(200).json(category)
      : res.status(404).json('Category does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Add Category
router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color
  })

  try {
    category = await category.save()
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json(error)
  }
})

// UPDATE CATEGORY
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    updatedCategory
      ? res.status(200).json(updatedCategory)
      : res.status(404).json('Category with this id does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

//Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id)
    deleted
      ? res.status(200).json('Category deleted successfully')
      : res.status(404).json('Category does not exist')
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router
