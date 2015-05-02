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
var graph = require('fbgraph');
var NYT = require('nyt'); 
var brokenMusicLink ='https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/417197_10149999285992991_711134825_n.png?oh=5f504d85a96f2380b2e321d724d15511&oe=55DC0D22&__gda__=1435991238_9b0901b9ebd35182a3dccd793d453e0b';
//local dependencies
var brokenLink2='https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/418333_10149999285994467_1920585607_n.png?oh=7d32e7fdad9c6cf1b0333b05245feb91&oe=55D6492D&__gda__=1439872202_649eda5738ff370b407d330b2a5fbec2';

var FACEBOOK_APP_ID = "1492518170992676";
var FACEBOOK_APP_SECRET = '50a28fba3f3012f061cf58004db24fa8';
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

app.get('/places', function(req, res) {
   graph.setAccessToken('1492518170992676|OvEPZvrNsm08FKa8tvVcSTW8lY0');
   graph.get("search?q=beach+san_diego&type=page&center=32.7150,-117.1625&distance=50000&limit=100000", function(err, res2) {

         var location = [];

         for (var i = 0; i < res2.data.length; i++) {
            location.push({
               url: res2.data[i].id,
            })
         };

         var locationINFO = [];
   
var i3=0;
        
         for (var i2 = 0; i2 < location.length; i2++) {

   
            graph.get("/" + location[i2].url + "?fields=description,checkins,likes,were_here_count,name,picture.type(large).width(600),link", function(err, res3) {
                  var locationPicurl;
var a ="false";

           if ((res3.picture.data.width >= 400)&&(res3.picture.data.url!=brokenMusicLink)&&(res3.picture.data.url!=brokenLink2)&&(res3.picture.data.url!='https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/418333_10149999285994467_1920585607_n.png?oh=7d32e7fdad9c6cf1b0333b05245feb91&oe=55D6492D&__gda__=1437280202_44cc3d9bbdc89cc4cc03a2ba3548da54')&&(res3.picture.data.url!='https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/v/t1.0-1/580798_10149999285995853_2130804811_n.png?oh=9d7c86b0f9b8d44f5140c79d8aa42b58&oe=5598A65F&__gda__=1436073212_5d1ecfb4933036d57c1f4e9a36983d60')&&(res3.picture.data.url != 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/418333_10149999285994467_1920585607_n.png?oh=56f79c7d99c8953b1d3d458b592706d6&oe=55AEBC2D&__gda__=1437280202_85508750ff88cded83a455f528cf0a18'))
                     {
                     locationPicurl = res3.picture.data.url;
                 i3++;
                   a ="true";       
                   }
                if (a == "true") 
                  var b =locationINFO.push({
                     locationurl: res3.link,
                     locationDescription: res3.description,
                     locationCheckins: res3.checkins,
                     locationLike: res3.likes,
                     locationWereHere: res3.were_here_count,
                     locationName: res3.name,
                     locationPic: locationPicurl
                  }); 
                   i2--;
                  if (i2==1) {
                       locationInFO = locationINFO.sort(
                           function(a, b){
                          var keyA = a.locationWereHere,
                          keyB = b.locationWereHere;
                            // Compare the 2 dates
                               if(keyA < keyB) return 1;
                              if(keyA > keyB) return -1;
                                     return 0;
                             }
                        );
                      
                     arr(locationINFO);
                     return;
                  }
               }) //graphinner

         };

         function arr(data2) {

            res.render('places', {
               res2: res2,
               location: data2
            });
         }
      }) //graph
});


app.get('/me', ensureAuthenticated, function(req, res) {
  
   var query = models.User.where({
      name: req.user.username
   });

   query.findOne(function(err, user) {
      if (err) return handleError(err);
      if (req.user) {
         // doc may be null if no document matched
         var user_profilePicture = "";
         Instagram.users.self({
            access_token: req.user.ig_access_token,
            count: 200,
            // user_id:req.user.id,
            complete: function(data) {
            
               //Map will iterate through the returned data obj
         
               
               if(data[0]!=null){
               var imageArr = data.map(function(item) {
                  //create temporary json object
                  tempJSON = [];
                  tempJSON.url2 = item.images.standard_resolution.url;
                  if(item.caption!=null)
                  tempJSON.pp = item.caption.text;
                  else
                       tempJSON.pp = " ";

                  tempJSON.the_profilePicture = item.user.profile_picture;
            
                  if(item.likes!=null)
                  tempJSON.numLikes = item.likes.count;
                   else
                       tempJSON.numLikes = 0;
                  return tempJSON;
               });
               }

               Instagram.users.info({
                  user_id: req.user.ig_id,
                  access_token: req.user.ig_access_token,
                  complete: function(data2) {
                     user_profilePicture = data2.profile_picture;
                     res.render('me', {
                        photos2: imageArr,
                        user: req.user,
                        user_profilePicture: user_profilePicture,
                        data:data[0]
                     });
                  }
               });

            }
         }); //instagram.users.self
      } //user if ends
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
