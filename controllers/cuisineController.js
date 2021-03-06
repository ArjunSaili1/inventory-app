const Cuisine = require("../models/cuisine");
const Meal = require("../models/meal");
const { body, validationResult } = require("express-validator");
const cloudinary = require("../utils/cloudinary");

module.exports.cuisine_list = async function (req, res, next) {
  try {
    const allCuisines = await Cuisine.find({}).exec();
    res.render("grid", { items: allCuisines, itemType: "Cuisine" });
  } catch (err) {
    return next(err);
  }
};

module.exports.cuisine_detail = async function (req, res, next) {
  try {
    const cuisine = await Cuisine.findById(req.params.id).exec();
    const cuisineMeals = await Meal.find({ cuisine: cuisine._id }).exec();
    res.render("cuisine_detail", {
      cuisine: cuisine,
      cuisineMeals: cuisineMeals,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.cuisine_create_get = function (req, res, next) {
  res.render("cuisine_form", { title: "Create Cuisine" });
};

module.exports.cuisine_create_post = [
  body("cuisine_name", "Cuisine Name is Required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("cuisine_description", "Cuisine description is required.")
    .isLength({ min: 1 })
    .escape(),
  async function (req, res, next) {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      res.render("cuisine_form", {
        title: "Create Cuisine",
        errors: validation["errors"],
      });
      return;
    }
    try {
      let newCuisine = new Cuisine({
        name: req.body.cuisine_name,
        description: req.body.cuisine_description,
      });
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          public_id: `cuisine/${newCuisine._id}`,
        });
        newCuisine.image = result.url;
      }
      await newCuisine.save();
      res.redirect(`/cuisine/${newCuisine._id}`);
    } catch (err) {
      return next(err);
    }
  },
];

module.exports.cuisine_update_get = async function (req, res, next) {
  try {
    const cuisine = await Cuisine.findById(req.params.id);
    res.render("cuisine_form", { title: "Update Cuisine", cuisine: cuisine });
  } catch (err) {
    return next(err);
  }
};

module.exports.cuisine_update_post = [
  body("cuisine_name", "Cuisine Name is Required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("cuisine_description", "Cuisine description is required.")
    .isLength({ min: 1 })
    .escape(),

  async function (req, res, next) {
    const cuisine = await Cuisine.findById(req.params.id);
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      res.render("cuisine_form", {
        title: "Update Cuisine",
        cuisine: cuisine,
        errors: validation["errors"],
      });
      return;
    }
    try {
      if (cuisine.title !== req.body.cuisine_name) {
        cuisine.name = req.body.cuisine_name;
      }
      if (cuisine.description !== req.body.cuisine_description) {
        cuisine.description = req.body.cuisine_description;
      }
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          public_id: `cuisine/${cuisine._id}`,
        });
        cuisine.image = result.url;
      }
      await cuisine.save();
      res.redirect(`/cuisine/${cuisine._id}`);
    } catch (err) {
      return next(err);
    }
  },
];

module.exports.cuisine_delete_get = async function (req, res, next) {
  try {
    const cuisine = await Cuisine.findById(req.params.id);
    const cuisineMeals = await Meal.find({
      cuisine: req.params.id,
    });
    res.render("delete_cuisine", {
      cuisine,
      deleteLink: req.originalUrl,
      cuisineMeals,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.cuisine_delete_post = async function (req, res, next) {
  try {
    const cuisineMeals = await Meal.find({
      cuisine: req.params.id,
    });
    if (cuisineMeals.length === 0) {
      await Cuisine.deleteOne({ _id: req.params.id });
      res.redirect("/cuisine");
    } else {
      res.redirect(`/cuisine/${req.params.id}`);
    }
  } catch (err) {
    return next(err);
  }
};
