if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');

const app = express();

const async = require("async")
const mysql2 = require("mysql2");
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override')
const bodyparser = require('body-parser')
var cookieParser = require('cookie-parser');

const initializePassport = require('./passport-config');
const { query } = require('express');

initializePassport(passport);

app.use('/js', express.static('./js/'))
app.use(express.static(__dirname + '/public'));

app.use(bodyparser.urlencoded({ extended: true }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))


app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(cookieParser());

//create local vaariables for all our templates to use
app.use(function(req, res, next) {
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    res.locals.successes = req.flash("success");
    next();
});

app.use(methodOverride('_method'))

app.set('views', './views')
app.set('view engine', 'ejs')

//database
const con = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "pocketsaver",
    multipleStatements:true,
    
});

con.connect((err) => {
    if (!err) {
        console.log("connected to MySQL server at port 3306...");
    } else {
        console.log(err);
    }
});

//database end

//login
app.get('/', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') })
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})
var users = [];

app.post('/', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true,
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user_Name = req.body.name;
        let user_Email = req.body.email;
        let user_Password = hashedPassword;
        con.query('INSERT INTO user (username, email, password) VALUES (?,?,?)', [user_Name, user_Email, user_Password])
        res.redirect('/')
    } catch (e) {
        console.log(e)
        res.redirect('/register')
    }
})

//logout
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }

    next()
}
//login end

//post req for newReceived and newSpent
app.post('/newReceived', (req, res) => {
    let received_Category = req.body.newReceCat;
    let received_Amount = req.body.newReceCatBudget;
    let remarks = req.body.newReceCatRemark;

    con.query('INSERT INTO fund(fundCategory, fundAmount,fundRemarks,userID) VALUES (?,?,?,(SELECT userID FROM user WHERE userID = ?))', [received_Category, received_Amount, remarks, req.session.passport.user], (err, result) => {
        if (err) {
            console.log(err);

        } else {
            res.redirect('/logbook')
            console.log(result)
            console.log("Inserted");

        }
    })

})

app.post('/newSpent', (req, res) => {
    let expenseTitle = req.body.newSpentCat;
    let expenseAmount = req.body.newSpentCatBudget;
    let expenseRemark = req.body.newSpentCatRemark;

    con.query('INSERT INTO expenses(expenseTitle, expenseAmount,expenseRemarks,userID) VALUES (?,?,?,(SELECT userID FROM user WHERE userID = ?))', [expenseTitle,expenseAmount,expenseRemark,req.session.passport.user], (err, result) => {
        if (err) {
            console.log(err);

        } else {
            res.redirect('/logbook')
            console.log(result)
            console.log("Inserted");
        }
    })

})

app.post('/setting', (req, res) => {
    let savingsAmount = req.body.editToSave;
    let name = req.body.editName;

    con.query('INSERT INTO savings(savingsAmount,userID) VALUES (?,(SELECT userID FROM user WHERE userID = ?)); UPDATE user SET name = ? WHERE userID = ?', [savingsAmount,req.session.passport.user,name,req.session.passport.user], (err, result) => {
        if (err) {
            console.log(err);

        } else {

            res.redirect('/settings')
            console.log(result)
            console.log("Inserted");
        }
    })

})

app.post('/editSpent', (req, res) => {
    let editSpentCat = req.body.editSpentCat;
    let editSpentCatBudget = req.body.editSpentCatBudget;
    

    con.query('UPDATE money_spent SET (spent_Category, spent_TotalAmount) VALUES (?,?)', [editSpentCat, editSpentCatBudget],'WHERE user_spent_ID VALUES (?)', [req.session.id], (err, result) => {
        console.log(req.session.user_ID)
        if (err) {
            console.log(err);

        } else {
            res.redirect('/settings')
            console.log(result)
            console.log("Inserted");

        }
    })

})


app.post('/editReceived', (req, res) => {
    let received_Category = req.body.receivedCategory;
    let editRecevied_Amount = req.body.editReceivedAmount;
    let editReceived_Notes = req.body.editReceivedNotes

    con.query('UPDATE money_received SET (received_Category, received_Amount, received_Notes) VALUES (?,?,?)', [received_Category, editRecevied_Amount, req.editReceived_Notes.id],'WHERE user_received_ID VALUES (?)', [req.session.id], (err, result) => {
        console.log(req.session.user_ID)
        if (err) {
            console.log(err);

        } else {
            res.redirect('/settings')
            console.log(result)
            console.log("Inserted");

        }
    })

})


app.post('/editSpent', (req, res) => {
    let spent_Category = req.body.newSpentCat;
    let spent_TotalAmount = req.body.newSpentCatBudget;

    con.query('INSERT INTO money_spent (spent_Category, spent_TotalAmount, user_spent_ID) VALUES (?,?,?)', [spent_Category, spent_TotalAmount, req.session.id], (err, result) => {
        console.log(req.session.id)
        if (err) {
            console.log(err);

        } else {
            res.redirect('/settings')
            console.log(result)
            console.log("Inserted");

        }
    })

})
//end
app.get('/calendar', (req, res) => {
    res.render('calendar')
})

app.get('/newSpent',checkAuthenticated, (req, res) => {
    res.render('newSpent')
})

app.get('/newReceived',checkAuthenticated, (req, res) => {
    res.render('newReceived')
})


app.get('/editReceived',checkAuthenticated, (req, res) => {
    res.render('editReceived')

})

app.get('/editSpent',checkAuthenticated, (req, res) => {
    res.render('editSpent')
})

app.get('/index', (req, res) => {
    res.render('index')
})

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/home', checkAuthenticated, (req, res) => {
    con.connect(function (err){
        if (err) throw err;
        console.log("connected")
        var sql = 'SELECT name FROM user WHERE userID=?'
        con.query(sql, [req.session.passport.user], function (err, result){
            console.log(req.session.passport.user)
            console.log(result)
            if (err){
                throw err;
            }else {
                var obj = result[0]
                console.log(obj.name)
                res.render('home.ejs', {object: obj.name})
            }
        })
    })
})

app.get('/analytics',checkAuthenticated, (req, res) => {
    /*con.connect(function (err){
        if (err) throw err;
        console.log("connected")
        var sql = 'SELECT name FROM user WHERE userID=?'

        con.query(sql, [req.session.passport.user], function (err, result){
            console.log(req.session.passport.user)
            console.log(result)
            if (err){
                throw err;
            }else {
                var obj = result[0]
                console.log(obj.name)
                res.render('analytics.ejs', {object: obj.name})
            }
        })*/

        con.connect(function (err){
            if (err) throw err;
            console.log("connected")
            //------------------ piereceived && piespent (problem, multiple sql)
            //pieFUND ~ RESULT[0] & RESULT[1]
            let pieFundTitleSQL = "SELECT userID, fundCategory FROM fund WHERE userID = ? GROUP BY fundCategory ORDER BY fundCategory DESC;";
            let pieFundAmountSQL= "SELECT SUM(fundAmount) AS totalFundPerCategory, userID FROM fund WHERE userID = ? GROUP BY fundCategory ORDER BY fundCategory DESC;";
    
            //pieEXPENSE ~ RESULT[2] & RESULT[3]
            let pieExpTitleSQL = "SELECT expenseTitle,userID FROM expenses WHERE userID = ? GROUP BY expenseTitle ORDER BY expenseTitle DESC;";
            let pieExpAmountSQL = " SELECT SUM(expenseAmount) AS totalExpensePerCategory, userID FROM expenses WHERE userID = ? GROUP BY expenseTitle ORDER BY expenseTitle DESC;";

            async.parallel([
                function(callback) { con.query(pieFundTitleSQL, [req.session.passport.user], callback) },
                function(callback) { con.query(pieFundAmountSQL, [req.session.passport.user], callback) },
                function(callback) { con.query(pieExpTitleSQL, [req.session.passport.user], callback) },
                function(callback) { con.query(pieExpAmountSQL, [req.session.passport.user], callback) },

              ], function(err, results) {
            

                  console.log(results[0][0][0])
                  console.log(results[1][0])
                  console.log(results[2][0])
                  console.log(results[3][0])
                  //profName = results[2][0]
                  //console.log(profName[0].name)
    
                  if (err){
                      console.log(err);
                  }else{
                    res.render('analytics', { pieFundTitle : results[0][0][0], pieFundAmount : results[1][0], pieExpTitle : results[2][0], pieExpAmount : results[3][0] });
                  }
                
         });
    })
})

 

app.get('/contactus',checkAuthenticated, (req, res) => {
    con.connect(function (err){
        if (err) throw err;
        console.log("connected")
        var sql = 'SELECT name FROM user WHERE userID=?'
        con.query(sql, [req.session.passport.user], function (err, result){
            console.log(req.session.passport.user)
            console.log(result)
            if (err){
                throw err;
            }else {
                var obj = result[0]
                console.log(obj.name)
                res.render('contactus.ejs', {object: obj.name})
            }
        })
    })
   
})

app.get('/help',checkAuthenticated, (req, res) => {
    con.connect(function (err){
        if (err) throw err;
        console.log("connected")
        var sql = 'SELECT name FROM user WHERE userID=?'
        con.query(sql, [req.session.passport.user], function (err, result){
            console.log(req.session.passport.user)
            console.log(result)
            if (err){
                throw err;
            }else {
                var obj = result[0]
                console.log(obj.name)
                res.render('help.ejs', {object: obj.name})
            }
        })
    })
   
})

app.get('/home',checkAuthenticated, (req, res) => {
    
    res.render('home')        
})

app.get('/logbook',checkAuthenticated, (req, res) => {
    con.connect(function (err){
        if (err) throw err;
        console.log("connected")
        var sql = 'SELECT DATE_FORMAT(fundDate, "%Y-%m-%d") AS "funDate",fundCategory,fundAmount FROM fund WHERE userID=? ORDER BY funDate'
        //SELECT DATE_FORMAT(fundDate, "%Y-%m-%d")
        var sql2 = 'SELECT expenseDate,expenseTitle,expenseAmount FROM expenses WHERE userID=?'
        var sql3 = 'SELECT name FROM user WHERE userID=?'
        async.parallel([
            function(callback) { con.query(sql, [req.session.passport.user], callback) },
            function(callback) { con.query(sql2, [req.session.passport.user], callback) },
            function(callback) { con.query(sql3, [req.session.passport.user], callback) }
          ], function(err, results) {
              console.log(results[0][0])
              console.log(results[1][0])
              profName = results[2][0]
              console.log(profName[0].name)

              if (err){
                  console.log(err);
              }else{
                res.render('logbook', { rows : results[0][0], rows2 : results[1][0], rows3 : profName[0].name});
              }
            
          });
    })
})

app.get('/settings',checkAuthenticated, (req, res) => {
    con.connect(function (err){
        if (err) throw err;
        console.log("connected")
        var sql = 'SELECT name FROM user WHERE userID=?'
        con.query(sql, [req.session.passport.user], function (err, result){
            console.log(req.session.passport.user)
            console.log(result)
            if (err){
                throw err;
            }else {
                var obj = result[0]
                console.log(obj.name)
                res.render('settings.ejs', {object: obj.name})
            }
        })
    })
   
})

app.get('/error', (req, res) => {
    res.render('error')
})


app.listen(3000, () => {
    console.log('listening is port 3000')
});

module.exports = con;