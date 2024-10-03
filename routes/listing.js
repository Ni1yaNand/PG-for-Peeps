const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn} = require("../middleware.js");


const validateListing = (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Invalid Listing Data");
  }
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};


//Index Route
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
router.get("/new", isLoggedIn,(req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
// app.get("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/show.ejs", { listing });
// });
router.get("/:id", wrapAsync (async(req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid Listing ID"));
  }

  const listing = await Listing.findById(id).populate("reviews");

  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}));


//Create Route
router.post(
  "/", 
  validateListing,
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
})
);

//Edit Route
// app.get("/listings/:id/edit", async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/edit.ejs", { listing });
// });
router.get("/:id/edit", isLoggedIn,wrapAsync(async(req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}));


//Update Route
// app.put("/listings/:id", 
//   validateListing,
//   wrapAsync(async (req, res) => {
//   let{ id } = req.params;
//   await Listing.findByIdAndUpdate(id, {...req.body.listing});
//   res.redirect(`/listings/${id}`);  
// }));
router.put("/:id", validateListing, isLoggedIn, wrapAsync(async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (!listing) {
    return next(new ExpressError(404, "Listing not found"));
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
}));


//Delete Route
// app.delete("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   res.redirect("/listings");
// });
router.delete("/:id", isLoggedIn,wrapAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    return next(new ExpressError(404, "Listing not found"));
  }

  console.log(deletedListing);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
}));

module.exports = router;