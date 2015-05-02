//dependencies for each module used
var express = require('express');
var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var Instagram = require('instagram-node-lib');
var async = require('async');
var app = express();

var NYT = require('nyt');

var keys = {
            'article-search':'d21016efef5d169d28e141ab68e7f7cf:5:71879521',
            'most-popular':'b08bcaa7d0363523e7c5583b4e265b6a:18:71879521',
            }

var nyt = new NYT(keys);


//local dependencies
var models = require('./models');

//client id and client secret here, taken from .env
dotenv.load();
var INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
var INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
var INSTAGRAM_CALLBACK_URL = process.env.INSTAGRAM_CALLBACK_URL;
Instagram.set('client_id', INSTAGRAM_CLIENT_ID);
Instagram.set('client_secret', INSTAGRAM_CLIENT_SECRET);

//connect to database
mongoose.connect(process.env.MONGODB_CONNECTION_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Database connected succesfully.");
});


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: INSTAGRAM_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
   models.User.findOne({
    "ig_id": profile.id
   }, function(err, user) {
      if (err) {
        return done(err); 
      }
      
      //didnt find a user
      if (!user) {
        newUser = new models.User({
          name: profile.username, 
          ig_id: profile.id,
          ig_access_token: accessToken
        });

        newUser.save(function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log('user: ' + newUser.name + " created.");
          }
          return done(null, newUser);
        });
      } else {
        //update user here
        user.ig_access_token = accessToken;
        user.save();
        process.nextTick(function () {
          // To keep the example simple, the user's Instagram profile is returned to

          return done(null, user);
        });
      }
   });
  }
));


//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));
app.use(passport.initialize());
app.use(passport.session());

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/login');
}

var yelp = require("yelp").createClient({
  consumer_key: "x4ZAU0MjLFPPyhwgc4cn5w", 
  consumer_secret: "9Z3zHTL3gw_E7K8Ja35RA9gvSXs",
  token: "zwddEOTzrQNGtZCNt6ziPaTdhkKnSG-1",
  token_secret: "XOX6vl-6ORm5t_q5jZ93TecLkNE"
});

function ensureAuthenticatedInstagram(req, res, next) {
  if (req.isAuthenticated() && !!req.user.ig_id) { 
    return next(); 
  }
  res.redirect('/login');
}


  var trends = require('node-google-search-trends');



app.get('/login', function(req, res){
  var healthnews=[];
  var healthnews2=[];
    var healthnews3=[];
nyt.mostPopular.shared({'section':'style', 'time-period':'7'}, function(data) {

                  var data2=JSON.parse(data).results;
         healthnews = data2.map(function(item) {
            //create temporary json object
            tempNEWS = [];
            tempNEWS.url = item.url;
               tempNEWS.title = item.title;
               tempNEWS.abstract = item.abstract;
               if(item.media.length>=1 && (item.media[0]['media-metadata'][0].url !=null)){
                 tempNEWS.image = item.media[0]['media-metadata'][0].url;
              // console.log(item.media[0]['media-metadata'][0].url);
              }
               else
                tempNEWS.image=null;
            return tempNEWS;

         });
   //  console.log(healthnews);
  });

nyt.mostPopular.shared({'section':'health', 'time-period':'7'}, function(data) {

                  var data2=JSON.parse(data).results;
             
         healthnews2 = data2.map(function(item) {
            //create temporary json object
            tempNEWS = [];
            tempNEWS.url = item.url;
               tempNEWS.title = item.title;
               tempNEWS.abstract = item.abstract;
               if(item.media.length>=1 && (item.media[0]['media-metadata'][0].url !=null)){
                 tempNEWS.image = item.media[0]['media-metadata'][0].url;
              // console.log(item.media[0]['media-metadata'][0].url);
              }
               else
                tempNEWS.image=null;
           
       
             return tempNEWS;

         });
   //  console.log(healthnews);
  });
nyt.mostPopular.shared({'section':'travel', 'time-period':'7'}, function(data) {

                  var data2=JSON.parse(data).results;
         healthnews3 = data2.map(function(item) {
            //create temporary json object
            tempNEWS = [];
            tempNEWS.url = item.url;
               tempNEWS.title = item.title;
               tempNEWS.abstract = item.abstract;

               if(item.media.length>=1 && (item.media[0]['media-metadata'][0].url !=null)){
                 tempNEWS.image = item.media[0]['media-metadata'][0].url;
              // console.log(item.media[0]['media-metadata'][0].url);
              }
               else
                tempNEWS.image=null;
            return tempNEWS;

         });
   //  console.log(healthnews);
  });

   var user_profilePicture ="";
    var firstName ="";
if(req.user!=null)

    
      if (req.user != null ) {
     
         var query = models.User.where({
            name: req.user.username
         });

         query.findOne(function(err, user) {
            if (err) return handleError(err);
            if (req.user) {

               Instagram.users.info({
                  user_id: req.user.ig_id,
                  access_token: req.user.ig_access_token,
                  // user_id:req.user.id,
                  complete: function(data) {
                     user_profilePicture = data.profile_picture;
                      firstName = data.full_name.substr(0, data.full_name.indexOf(' '));
                  }
               });
            }
         });

      } //if ends 




var yelpResults =[];
var locationArray = ["irvine,ca", "la jolla,ca","california","vista,ca","spring valley,ca"];
//console.log(locationArray[0]);
for(var j =0; j<locationArray.length;j++){

    bb(j);
    function bb(j){

yelp.search({term: "shopping center", offset:"0",sort:"2",location:locationArray[j],radius_filter:"56000",category_filter:"shoppingcenters,fashion"}, function(error, data) {
 //console.log(data);
  for(var i = 0 ; i<data.businesses.length;i++){
             if(data.businesses[i]!=null &&data.businesses[i].rating>2.9 && data.businesses[i].name!=undefined &&data.businesses[i].url!=undefined)
     yelpResults.push({
            latitude: data.businesses[i].location.coordinate.latitude,
            longitude: data.businesses[i].location.coordinate.longitude,
             rating:data.businesses[i].rating,
            name:data.businesses[i].name,
            image_url:data.businesses[i].mobile_url,
     });

   // console.log("final result is " + i+" "+yelpResults[i].latitude);
  if(i == data.businesses.length-1){

   yelp.search({term: "shopping center", offset:"20",sort:"2",location:locationArray[j],radius_filter:"56000",category_filter:"shoppingcenters,fashion"}, function(error, data2) {

    //console.log(data.businesses);

    for(var i2 = 0 ; i2<data2.businesses.length;i2++){
if(data2.businesses[i2]!=null)
 // console.log(data2.businesses[i2].name);
         if(data2.businesses[i]!=null &&data2.businesses[i].rating>2.9 &&data2.businesses[i2].url!=undefined)


         yelpResults.push({
              latitude: data2.businesses[i2].location.coordinate.latitude,
              longitude: data2.businesses[i2].location.coordinate.longitude,
              rating:data2.businesses[i2].rating,
                name:data2.businesses[i2].name,
              image_url:data2.businesses[i2].mobile_url,
              user: req.user 
           }); 

 if(j == locationArray.length-1 && i2==data.businesses.length-1){
             //  console.log("final result is " + i2+" "+yelpResults.length);
               returna(yelpResults);
               return;
           
         }

         }//for loop 2

      });//this is inside the if 
    }

      

  }

});//search

}
}//outside for loop


function returna(yelpResults){

//  var trends = require('node-google-search-trends');
trends('United States', 10, function(err, data){
   //console.log(data);
    if (err) 
      return console.err(err);
   // console.log(JSON.stringify(data, null, 2));  // Pretty prints JSON 'data'
        var dataArray = [];
        var a = 1;
       // console.log(data[1]);
        // console.log(data[2]['ht:news_item']);
        for(var counter=0; counter<10;counter++)
         {
        //  console.log(counter);
            dataArray.push({
             dataLink:data[counter]['ht:news_item'][0]['ht:news_item_url'],
             dataTitle:data[counter].title[0],
             dataPicture:data[counter]['ht:picture'][0],
             
           });
         }
    
    if(req.user == null){

       res.render('login', {data:dataArray, 
      yelpResults: yelpResults,
      healthnews:healthnews,
      healthnews2:healthnews2.slice(0,7),
      healthnews3:healthnews3.slice(0,7),
              user: req.user,
                      });
    }
      else{

     res.render('login', {data:dataArray, 
      yelpResults: yelpResults,
      healthnews:healthnews,
      healthnews2:healthnews2.slice(0,7),
      healthnews3:healthnews3.slice(0,7),
              user: req.user,
               user_profilePicture: user_profilePicture,
                      });
   }
     
 });
 }//function
});


//routes
app.get('/', function(req, res){
  res.redirect('/login');
});

app.get('/account', ensureAuthenticated, function(req, res) {
var query = models.User.where({
         name: req.user.username
      });
      query.findOne(function(err, user) {
         if (err) return handleError(err);
         if (req.user) {
            Instagram.users.info({
               user_id: req.user.ig_id,
               access_token: req.user.ig_access_token,
               // user_id:req.user.id,
               complete: function(data) {
                  var user_profilePicture = data.profile_picture;
                  var firstName = data.full_name.substr(0, data.full_name.indexOf(' '));
                  res.render('account', {
                     user: req.user,
                     user_profilePicture: user_profilePicture,
                     firstName: firstName,
                  });
               }
            });
         }
      });


});



app.get('/photos', ensureAuthenticatedInstagram, function(req, res){
  var query  = models.User.where({ ig_id: req.user.ig_id });
  query.findOne(function (err, user) {
    if (err) return err;
    if (user) {
      // doc may be null if no document matched
      Instagram.users.liked_by_self({
        access_token: user.ig_access_token,
        complete: function(data) {
          console.log(data);
          //Map will iterate through the returned data obj
          var imageArr = data.map(function(item) {
            //create temporary json object
            tempJSON = {};
            tempJSON.url = item.images.low_resolution.url;
            //insert json object into image array
            return tempJSON;
          });
          res.render('photos', {photos: imageArr});
        }
      }); 
    }
  });
});

app.get('/igMediaCounts', ensureAuthenticatedInstagram, function(req, res){
  var query  = models.User.where({ ig_id: req.user.ig_id });
  query.findOne(function (err, user) {
    if (err) return err;
    if (user) {
      Instagram.users.follows({ 
        user_id: user.ig_id,
        access_token: user.ig_access_token,
        complete: function(data) {
          // an array of asynchronous functions
          var asyncTasks = [];
          var mediaCounts = [];
           
          data.forEach(function(item){
            asyncTasks.push(function(callback){
              // asynchronous function!
              Instagram.users.info({ 
                  user_id: item.id,
                  access_token: user.ig_access_token,
                  complete: function(data) {
                    mediaCounts.push(data);
                    callback();
                  }
                });            
            });
          });
          
          // Now we have an array of functions, each containing an async task
          // Execute all async tasks in the asyncTasks array
          async.parallel(asyncTasks, function(err){
            // All tasks are done now
            if (err) return err;
            return res.json({users: mediaCounts});        
          });
        }
      });   
    }
  });
});

app.get('/visualization', ensureAuthenticatedInstagram, function (req, res){
  var query = models.User.where({
         name: req.user.username
      });
      query.findOne(function(err, user) {
         if (err) return handleError(err);
         if (req.user) {
            Instagram.users.info({
               user_id: req.user.ig_id,
               access_token: req.user.ig_access_token,
               // user_id:req.user.id,
               complete: function(data) {
                  var user_profilePicture = data.profile_picture;
                  var firstName = data.full_name.substr(0, data.full_name.indexOf(' '));
                  res.render('visualization', {
                     user: req.user,
                     user_profilePicture: user_profilePicture,
                     firstName: firstName,
                  });
               }
            });
         }
      });

}); 


app.get('/c3visualization', ensureAuthenticatedInstagram, function (req, res){
  var query = models.User.where({
         name: req.user.username
      });
      query.findOne(function(err, user) {
         if (err) return handleError(err);
         if (req.user) {
            Instagram.users.info({
               user_id: req.user.ig_id,
               access_token: req.user.ig_access_token,
               // user_id:req.user.id,
               complete: function(data) {
                  var user_profilePicture = data.profile_picture;
                  var firstName = data.full_name.substr(0, data.full_name.indexOf(' '));
                  res.render('c3visualization', {
                     user: req.user,
                     user_profilePicture: user_profilePicture,
                     firstName: firstName,
                  });
               }
            });
         }
      });

}); 

app.get('/auth/instagram',
  passport.authenticate('instagram'),
  function(req, res){
    // The request will be redirected to Instagram for authentication, so this
    // function will not be called.
  });

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
