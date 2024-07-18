// required modules to run the app

const fs = require("fs")
const mysql = require("mysql")
const crypto = require("crypto")
const jsdom = require("jsdom")
const querystring = require("querystring")
const express = require("express")
const cookieParser = require('cookie-parser')

// app initialization
let app = express()
let webpages = ["login", "register", "home"]
let htmlFiles = {}
app.use(cookieParser("your-secret-here"))

// connecting to the mysql database
let sqlDatabase = mysql.createConnection({
    host: "localhost",
    user: "loginsdatabase",
    password: 'YOUR-PASSWORD-HERE',
    database: "PWDAPPLICATION"
})

sqlDatabase.connect((err) => {
    if (err) {
        throw err
    }
    console.log("Successfully connected to MySQL")
})

// helper functions

function websiteErrorMsg(site, message) { // creates an error message for a website
    let dom = new jsdom.JSDOM(site, {url: "http://localhost:3000", contentType: "text/html", pretendToBeVisual: false})
    dom.window.document.getElementById("errormsg").innerHTML = message
    return dom.serialize()
}

// internet api
/*
app.get("/", function(req, res) {
    res.send(req.cookies)
})

app.get("/makecookie", function(req, res) {
    res.cookie("testcookie", "blablablablabla")
    res.send("cookie data added")
})

app.get("/destroycookie", function(req, res) {
    res.clearCookie("testcookie")
    res.send("cookie destroyed")
})
*/

// reading in html files for each page
for (const webpage of webpages) {
    fs.readFile("pages/" + webpage + ".html", {encoding: "utf-8"}, function(err,data){
        if (!err) {
            htmlFiles[webpage] = data
        }
    });
}

// webpages handler
app.get("/", (req, res) => {
    res.send("<script>window.location='./login'</script>")
})

app.get("/login", (req, res) => {
    let cookie = req.signedCookies["pwdapplication-cookie"]
    if (cookie) {
        res.send("<script>window.location='./home'")
        return
    }
    res.send(htmlFiles.login)
})

app.get("/register", (req, res) => {
    let account = req.signedCookies["pwdapplication-cookie"]
    if (account) {
        res.send("<script>window.location='./home'")
        return
    }
    res.send(htmlFiles.register)
})

app.get("/home", (req, res) => {
    let cookie = req.signedCookies["pwdapplication-cookie"]
    if (!cookie) { // unidentified users should not be on the home screen
        res.send("<script>window.location='./login'</script>")
        return
    }

    // verifying that the cookie is valid
    sqlDatabase.query(`select * from accounts where id = ${cookie};`, (err, response) => {
        if (err) {
            throw err
        }

        if (response.length == 0) {
            console.log("Invalid cookie detected")
            res.clearCookie("pwdapplication-cookie")
            res.send("<script>window.location='./login'</script>")
            return
        }

        sqlDatabase.query(`select * from userdata where id = ${cookie};`, (e, userdata) => {
            if (e) {
                throw e
            }
            
            let account = response[0]
            let dom = new jsdom.JSDOM(htmlFiles.home, {url: "http://localhost:3000", contentType: "text/html", pretendToBeVisual: false})
            let document = dom.window.document
            document.getElementById("welcomemsg").innerHTML = `Welcome, ${account.username}!`
            res.send(dom.serialize())
        })
    })
})

app.get("/logout", (req, res) => { // destroys the user's cookie and logs them out
    res.clearCookie("pwdapplication-cookie")
    res.send("<script>window.location='./login'</script>")
})

// backend api stuff goes here
app.get("/userdata", (req, res) => { // sends the user's data table to the client
    let cookie = req.signedCookies["pwdapplication-cookie"]
    if (!cookie) {
        res.sendStatus(401)
        return
    }

    sqlDatabase.query(`select * from userdata where id = ${cookie};`, (error, response) => {
        if (error) {
            throw error
        }

        data = []
        for (let i = 0; i < response.length; i++) {
            data.push(response[i])
        }

        res.status(200).send(JSON.stringify(data))
    })
})

app.post("/login", (req, res) => { // handles logging into accounts
    let body = ""
    req.on("data", (data) => {
        body += data
        if (body.length > 1e6) {
            req.connection.destroy()
        }
    })

    req.on("end", () => {
        let params = querystring.parse(body)
        let username = params.login[0]
        let password = params.login[1]

        for (const c in username) { // sanitizing input to prevent sql injections
            if (!("qwertyuiopasdfghjklzxcvbnm1234567890_".match(c.toLowerCase()))) {
                res.send(websiteErrorMsg(htmlFiles.register, "Username may only contain alphanumeric characters or underscores."))
            }
        }

        // validating the username
        
        sqlDatabase.query(`select * from accounts where username = ?`, [username], (err, result) => {
            if (err) {
                throw err
            }
            
            if (result.length == 0) {
                res.send(websiteErrorMsg(htmlFiles.login, "Unable to find username in website database."))
                return
            }
    
            // validating the password
            let account = result[0]
            if (account.hash == crypto.createHash("sha256").update(password + account.salt).digest("hex")) {
                // generating user cookie
                res.cookie("pwdapplication-cookie", account.id.toString(), {signed: true, maxAge: 3600000})
                res.send("<script>window.location='./home'</script>")
            } else {
                res.send(websiteErrorMsg(htmlFiles.login, "Password is incorrect."))
            }
        })
    })
})

app.post("/register", (req, res) => { // lets you create an account
    let body = ""
    req.on("data", (data) => {
        body += data
        if (body.length > 1e6) {
            req.connection.destroy()
        }
    })

    req.on("end", () => {
        let params = querystring.parse(body)
        let username = params.register[0]
        let password = params.register[1]
        let confirms = params.register[2]

        // sanitizing the inputs
        if (username.length > 20) {
            res.send(websiteErrorMsg(htmlFiles.register, "Username must be less than 20 characters long."))
            return
        }

        if (username.length == 0) {
            res.send(websiteErrorMsg(htmlFiles.register, "Username must not be blank."))
            return
        }

        for (const c in username) {
            if (!("qwertyuiopasdfghjklzxcvbnm1234567890_".match(c.toLowerCase()))) {
                res.send(websiteErrorMsg(htmlFiles.register, "Username may only contain alphanumeric characters or underscores."))
            }
        }

        sqlDatabase.query(`select * from accounts where username = "${username}";`, (err, result) => {
            if (err) {
                throw err
            }
            if (result.length > 0) {
                res.send(websiteErrorMsg(htmlFiles.register, "Username " + username + " is already taken."))
                return
            }
            if (!(password === confirms)) {
                res.send(websiteErrorMsg(htmlFiles.register, "Confirmation field does not match password field."))
                return
            }
    
            // initializing the account and putting it into the database
            let salt = crypto.randomBytes(4).toString("hex");
            let hash = crypto.createHash("sha256").update(password + salt).digest("hex")
            let id = 1
            sqlDatabase.query("select id from accounts order by id desc limit 1;", (error, lastAccount) => {
                if (error) {
                    throw error;
                }
                if (lastAccount.length > 0) {
                    id = lastAccount[0].id + 1
                }
                // create the account and give the user the cookie
                sqlDatabase.query(`insert into accounts (id, username, hash, salt) values (${id}, "${username}", "${hash}", "${salt}");`)
                res.cookie("pwdapplication-cookie", id.toString(), {maxAge: 3600000, signed: true})
                res.send("<script>window.location='./home'</script>")
            })
        })
    })
})

app.post("/addEntry", (req, res) => {
    let body = ""
    req.on("data", (data) => {
        body += data
        if (body.length > 1e6) {
            req.connection.destroy()
        }
    })

    req.on("end", () => {
        let cookie = req.signedCookies["pwdapplication-cookie"]
        if (!cookie) {
            res.status(401).send(JSON.stringify({message: "No cookie found/cookie is invalid."}))
            return
        }

        sqlDatabase.query(`select * from accounts where id = ${cookie};`, (err, data) => {
            if (err) {
                throw err
            }

            if (data.length == 0) {
                res.status(401).send(JSON.stringify({message: "User no longer exists"}))
                return
            }

            let params = JSON.parse(body)
            let website = params.website
            let username = params.username
            let password = params.password

            sqlDatabase.query("select dataid from userdata order by dataid desc limit 1;", (error, response) => { // assigning a data id to the entry the user wants to add
                if (error) {
                    throw error
                }

                let dataid = 1
                if (response.length > 0) {
                    dataid = response[0].dataid + 1
                }

                sqlDatabase.query(`insert into userdata (id, dataid, website, username, password) values (?, ?, ?, ?, ?);`, [cookie, dataid, website, username, password])
                res.status(200).send(JSON.stringify({"dataid": dataid, "website": website, "username": username, "password": password}))
            })
        })
    })
})

app.post("/deleteEntry", (req, res) => { // removes user's entry from their data table
    let body = ""
    req.on("data", (data) => {
        body += data
        if (body.length > 1e6) {
            req.connection.destroy()
        }
    })

    req.on("end", () => {
        let cookie = req.signedCookies["pwdapplication-cookie"]
        if (!cookie) {
            res.sendStatus(401)
            return
        }
        sqlDatabase.query("delete from userdata where dataid = ?;", [body])
        res.sendStatus(200)
    })
})

app.post("/editEntry", (req, res) => { // modifies an entry that exists in the user's data table
    let body = ""
    req.on("data", (data) => {
        body += data
        if (body.length > 1e6) {
            req.connection.destroy()
        }
    })

    req.on("end", () => {
        let cookie = req.signedCookies["pwdapplication-cookie"]
        if (!cookie) {
            res.sendStatus(401)
            return
        }
        
        let params = JSON.parse(body)
        sqlDatabase.query("update userdata set website = ?, username = ?, password = ? where dataid = ?;", [params.website, params.username, params.password, params.dataid])
        res.sendStatus(200)
    })
})

// connection initializer
app.listen(3000, function(err) {
    if (err) {
        throw err
    }
    console.log("listening on port 3000")
})