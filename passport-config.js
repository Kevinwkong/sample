var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var bcrypt = require('bcrypt');
const mysql2 = require('mysql2');

//database
const con = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "pocketsaver"
});

con.connect((err) => {
    if (!err) {
        console.log("connected to MySQL server at port 3306...");
    } else {
        console.log(err);
    }
});
//database end

// expose this function to our app using module.exports
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.userID);
    });

    // used to deserialize the user
    passport.deserializeUser(function(userID, done) {
        con.connect();
    
        con.query("SELECT * FROM user WHERE userID = ?",[userID], function(err, rows){
            done(err, rows);
        });
        
    });

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'name',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, name, password, done) { // callback with email and password from our form
            con.connect();
            con.query("SELECT * FROM user WHERE username = ?",[name], async function(err, res){
                //console.log(password)
                if (err)
                    return done(err);
                if (!res.length) {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong name.')); // req.flash is the way to set flashdata using connect-flash
                }
                // if the user is found but the password is wrong
                try{
                    if (await bcrypt.compare(password, res[0].password)){
                    console.log(res[0].password +" inlogin")
                    console.log(password)
                    return done(null, res[0])
                        
                       
                       
                    }else{ 
                        console.log("FAILED")
                        
                        return done(null, false, {message: 'Oops! Wrong password.'})

                       
                    }}
                    catch (e){
                        return done(e)
                    }
                
            }) 
        })
    );
};