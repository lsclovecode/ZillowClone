var express = require('express');
var passwordHash = require('password-hash');
var session = require('client-sessions');
var User = require('../model/user');
var User_watchlist = require('../model/user_watchlist');
var rpc_client = require('../rpc_client/rpc_client');
var redis = require('redis');
var router = express.Router();


//creat a new redis client and connect to our local redis instance
var client = redis.createClient();

client.on('error',function(err){
  console.log("Error " + err);
});

TITLE = 'Smart Zillow';

/* Index page */
router.get('/', function(req, res, next) {
  var user = checkLoggedIn(req, res)
  res.render('index', { title: TITLE, logged_in_user: user });
});

router.get('/setting', function(req, res, next) {
  var user = checkLoggedIn(req, res)
  var email = req.session.user
  User.findOne({ email : email },function(err, user) {
    if (err) throw err;
    if (user.length > 0) {
      console.log("UserList found for: " + email);
    } else {
      res.render('setting', { title: TITLE, Permission: user['emailSend_permission'],logged_in_user: user});
    }
  });
});

router.post('/closeEmailPermission', function(req, res, next) {
  var user = checkLoggedIn(req, res)
  var email = req.session.user
  User.update({ email : email }, {$set:{emailSend_permission:false}}, function(err) {
    if (err) throw err;
    res.redirect('/setting');
  });
});

router.post('/openEmailPermission', function(req, res, next) {
  var user = checkLoggedIn(req, res)
  var email = req.session.user
  User.update({ email : email }, {$set:{emailSend_permission:true}}, function(err) {
    if (err) throw err;
    res.redirect('/setting');
  });
});

/* Search page */
router.get('/search', function(req, res, next) {
  var query = req.query.search_text;
  console.log("search text: " + query)
  console.log(req.params)
  var params = req.params

  client.get(params,function(error,result){
      if(result){
        results = JSON.parse(result)
        console.log("This is result "+results)
        res.render('search_result',{
          title: TITLE,
          query: query,
          results: results
        })
      }else{
        rpc_client.searchArea(query, function(response) {
        results = [];
        if (response == undefined || response === null) {
          console.log("No results found");
        } else {
          results = response;
        }

        // Add thousands separators for numbers.
        addThousandSeparatorForSearchResult(results);

        value = JSON.stringify(results)
        client.set(params,value);
        console.log("This is results "+results)
        res.render('search_result', {
          title: TITLE,
          query: query,
          results: results
        });

      });
      }
  })


});

router.get('/watchlist', function(req, res, next) {
  var user = checkLoggedIn(req, res)
  var email = req.session.user
  console.log("req.params are " + req.params)
  var params = req.params

  client.get(params,function(error,result){
      if(result){
        result = JSON.parse(result)
        result_num = result.length;
        console.log("This is result "+result)
        res.render('watchlist', { title: TITLE, logged_in_user: user,results:result,result_num:result_num});
      }else{
        rpc_client.listItems(email,function(response) {
        results = [];
        if (response == undefined || response === null) {
          console.log("No results found");
        } else {
          results = response;
          }
          value = JSON.stringify(results)
          client.set(params,value);
          result_num = results.length;
          console.log("This is results: " + results)
          res.render('watchlist', { title: TITLE, logged_in_user: user,results:results,result_num:result_num});
        })
      }
  })


});

router.post('/watchlist', function(req, res, next) {
  var user = checkLoggedIn(req, res)
  var zpid = req.body.zpid
  var email = req.session.user
  console.log("delelte" + zpid)
  rpc_client.deleteItem(email,zpid,function(response) {
    results = [];
    if (response == undefined || response === null) {
      console.log("No results found");
    } else {
      res.redirect('/watchlist');
    }
  })
});

/* Property detail page*/
router.get('/detail', function(req, res, next) {
  logged_in_user = checkLoggedIn(req, res)
  var email = req.session.user
  var id = req.query.id
  console.log("detail for id: " + id)

  rpc_client.getDetailsByZpid(id, function(response) {
    property = {}
    if (response === undefined || response === null) {
      console.log("No results found");
    } else {
      property = response;
    }

    // Handle predicted value
    var predicted_value = parseInt(property['predicted_value']);
    var list_price = parseInt(property['list_price']);
    property['predicted_change'] = ((predicted_value - list_price) / list_price * 100).toFixed(2);

    // Add thousands separators for numbers.
    addThousandSeparator(property);

    // Split facts and additional facts
    splitFacts(property, 'facts');
    splitFacts(property, 'additional_facts');

    var zpid = property.zpid;
    var street_address = property.street_address;
    var city= property.city;
    var state= property.state;
    var zipcode= property.zipcode;
    var property_type= property.property_type;
    var bedroom= property.bedroom;
    var bathroom= property.bathroom;
    var size= property.size;
    var is_for_sale= property.is_for_sale;
    var list_price= property.list_price;
    console.log("This is zpid " + zpid)
    console.log("This is zpid " + street_address)
    console.log("This is zpid " + city)
    console.log("This is zpid " + state)
    console.log("This is zpid " + zipcode)
    console.log("This is zpid " + property_type)
    console.log("This is zpid " + bedroom)
    console.log("This is zpid " + bathroom)
    console.log("This is zpid " + size)
    console.log("This is zpid " + is_for_sale)
    console.log("This is zpid " + list_price)
    User_watchlist.find({ email : email,zpid: zpid }, function(err, users) {
    if (err) throw err;
    if (users.length > 0) {
      console.log("UserList found for: " + email);
    } else {
        var newUserList = User_watchlist({
          email : email,
          zpid : zpid,
          street_address: street_address,
          city: city,
          state: state,
          zipcode: zipcode,
          property_type: property_type,
          bedroom: bedroom,
          bathroom: bathroom,
          size: size,
          is_for_sale: is_for_sale,
          list_price: list_price,
        });
        // Save the user.
        newUserList.save(function(err) {
          if (err) throw err;
          console.log('UserList created!');
        });
    }
  });

    res.render('detail',
      {
        title: 'Smart Zillow',
        query: '',
        logged_in_user: logged_in_user,
        property : property
      });
  });
});

/* Login page */
router.get('/login', function(req, res, next) {
  res.render('login', { title: TITLE });
});

/* Login submit */
router.post('/login', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  User.find({ email : email }, function(err, users) {
    console.log(users);
    if (err) throw err;
    // User not found.
    if (users.length == 0) {
      res.render('login', {
        title : TITLE,
        message : "User not found. Or <a href='/register'>rigester</a>"
      });
    } else {
      // User found.
      var user = users[0];
      if (passwordHash.verify(password, user.password)) {
        req.session.user = user.email;
        res.redirect('/');
      } else {
        res.render('login', {
          title : TITLE,
          message : "Password incorrect. Or <a href='/register'>rigester</a>"
        });
      }
    }
  });
});

/* Register page */
router.get('/register', function(req, res, next) {
  res.render('register', { title: TITLE });
});

/* Register submit */
router.post('/register', function(req, res, next) {
  // Get form values.
  var email = req.body.email;
  var password = req.body.password;
  var hashedPassword = passwordHash.generate(password);

  // Check if the email is already used.
  User.find({ email : email }, function(err, users) {
    if (err) throw err;
    if (users.length > 0) {
      console.log("User found for: " + email);
      res.render('register', {
        title: TITLE,
        message: 'Email is already used. Please pick a new one. Or <a href="/login">Login</a>'
      });
    } else {
        var newUser = User({
          email : email,
          password : hashedPassword,
        });
        // Save the user.
        newUser.save(function(err) {
          if (err) throw err;
          console.log('User created!');
          req.session.user = email;
          res.redirect('/');
        });
    }
  });
});

/* Logout */
router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

function checkLoggedIn(req, res) {
  // Check if session exist
  if (req.session && req.session.user) {
    return req.session.user;
  }
  return null;
}

function splitFacts(property, field_name) {
  facts_groups = [];
  group_size = property[field_name].length / 3;
  facts_groups.push(property[field_name].slice(0, group_size));
  facts_groups.push(property[field_name].slice(group_size, group_size + group_size));
  facts_groups.push(property[field_name].slice(group_size + group_size));
  property[field_name] = facts_groups;
}

function addThousandSeparatorForSearchResult(searchResult) {
  for (i = 0; i < searchResult.length; i++) {
    addThousandSeparator(searchResult[i]);
  }
}

function addThousandSeparator(property) {
  property['list_price'] = numberWithCommas(property['list_price']);
  property['size'] = numberWithCommas(property['size']);
  property['predicted_value'] = numberWithCommas(property['predicted_value']);
}

function numberWithCommas(x) {
  if (x != null) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

module.exports = router;
