var mongoose = require('mongoose');

var mySchema = mongoose.Schema;

// Create a user schema.
var userSchema = new mySchema({
  email: { type: String, required: true },
  zpid: { type: String},
  street_address: { type: String},
  city: { type: String},
  state: { type: String},
  zipcode: { type: String},
  property_type: { type: String},
  bedroom: { type:String},
  bathroom: { type:String},
  size: { type:String},
  is_for_sale: { type: String},
  list_price: { type:String},
});

// Map the scehma to database.
var User_watchlist = mongoose.model('userlist', userSchema);

module.exports = User_watchlist;
