# pwmanager-basic
This is a password management web application made for testing purposes. The front end uses basic Web3(HTML, CSS, and Javascript) and the backend uses Node.js + MySQL. This app has everything you woud expectfrom a password management application including an account system (registration + login), and a GUI where passwords for different accounts can be managed. It also supports docker for ease of running on different machines. You can access the dockerized build of this application under the releases for this repository, and the docker-compose project version of this application under the docker branch of this repository.

# How to setup
Step 1: Ensure that Node.js and MySQL are installed. You must also ensure that the MySQL service is running. <b>Note that Node.js should be running on version v20.15.1 and that MySQL should be running on the most updated version or there may be compatability issues with this program.</b> <br>
Step 2: Log into MySQL as root and run databaseinit.sql. This will set up the database, the tables, and the account used by the backend to log into the database. If you want to change the password of this account, go to line 23 of databaseinit.sql and find a string that says 'YOUR-PASSWORD-HERE' and change it to the password you want, then go to backend.js at line 21 and change the string that says "YOUR-PASSWORD-HERE" to the password you set in databaseinit.sql. <br>
Step 3: Run "npm install" in the repository directory. This will install the prerequisite modules required for the backend to run. <br>
Step 4: Go to line 15 of backend.js and where you see the string "your-secret-here" put the secret you want to use for cookie signing.<br>
Step 5: Open port 3000 on your computer, and/or port 443 if you plan to host this on a proper website. <br>
Step 6: Run "node backend.js" to start the application. <br>

# Features (Client)
If you visit the application's website and do not choose a subpage, you will be immediately redirected to the login page if you are not currently logged into an account.

![alt text](./images/login%20page.png)

This page directs you to the home page on successful login, and offers feedback if a login was unsuccessful. However, you may not have an account yet, and can click the "Create Account" button to reach the account registration page.

![alt text](./images/register%20page.png)

Similarly to the login page, this page will direct you to the home page on successful login, and also offers feedback if registration was unsuccessful. Note that when registering for an account, the password must be confirmed by entering it in a second time, and the password and confirmation fields much match before registration is allowed. If the page was reached on accident, simply click "Back" to go back to the login page.

![alt text](./images/home%20page.png)

Once you have created an account and/or logged in, you will be greeted to the homepage. You will also be greated to the homepage if you go to the website without visiting a subpage while logged in. Here, you can see all the passwords you have stored for all the websites. The homepage allows you to easily add entries (see the green row in the table) and edit entries (the editor is the blue row in the table). <b>Note that websites may only be 100 characters long at most, and that usernames and passwords can only be 20 characters at most. Also note that you may only use ASCII characters for these fields.</b>

![alt text](./images/settings%20page.png)

Unhappy with your account's username or password? Feel free to change them in the settings page. Obviously, your password is not shown on screen for privacy reasons (and because the service actually doesn't know your password), but you can still change it to whatever you want in a similar fashion to how you first created your password in the registration page. Once again, this page will give feedback whenever a request is unable to be fulfilled by the server.

# Features (Server)

![alt text](./images/database%20diagram.jpg)

On the server, the backend is a MySQL database with three tables, as shown in the diagram. The accounts table is used for the login/registration system, and for user identification. The primary key of the table is the username field which is used to find which account a user wants to log into during the login process, and the id is a unique key used to match the accounts with user data in the userdata table.

Some security features:
-The passwords for the users are stored as a SHA256 hex string (hash), with an 8 character hexadecimal salt string. <br>
-All cookies are signed and expire after an hour. 