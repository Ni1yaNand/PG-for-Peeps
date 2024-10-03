const express = require("express");
const router = express.Router({mergeParams : true});  //
const mongoose = require("mongoose");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(", ");
      throw new ExpressError(400, msg);
    } else {
      next();
    }
  };

  
//Reviews - POST Route
router.post("/", validateReview, wrapAsync (async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}));

//DELETE REVIEW route
router.delete("/:reviewId", wrapAsync(async(req, res) => {
  let {id, reviewId} = req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;