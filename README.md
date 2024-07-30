# pwmanager-basic
This is the docker branch of my password management web application. This branch is for people who want to run my app as a docker-compose project, or who want to build docker images to run this app.

# How to setup/run
Step 1: Ensure that Docker is installed on your computer and is up and running.<br>
Step 2: Go to line 3 of mysql.Dockerfile and change the root password to whatever you desire. <br>
Step 3: Go to lines 34 and 36 of databaseinit.sql and line 21 of backend.js and change all instances of "YOUR-PASSWORD-HERE" to the password you want to use to authenticate the loginsdatabase MySQL database account. <br>
Step 4: Run "docker-compose up" to start the project. Note that it will error the first time it is ever run on the project due to a minor bug in the mysqldb container health check. <br>

# How to build for release
If you want to build the project in a similar manner to the docker build released for this project, here are the necessary steps: <br>
Step 1: Complete all the setup steps (including a run of "docker-compose up") and then do "docker image ls" in your command line. Ensure that you have images "pwmanager-basic_app" and "pwmanager-basic_mysqldb" in the images list. Note that depending on your version of docker, these images may be named/tagged as "pwmanager-basic-app" and "pwmanager-basic-mysqldb" instead. You may rename these images by using "docker image tag [container name here] [desired name here]" and then doing "docker image rm [old image name here]" to cleanup the old tag for the image. <br>
Step 2: Run the following commands in your terminal:
<pre>
docker save -o mysqldb.tar pwmanager-basic_mysqldb
docker save -o app.tar pwmanager-basic_app
</pre>
If this step was completed successfully, you should see two new files in this project's directory: app.tar, and mysqldb.tar. <br>
Step 3: Create a directory in which all the build files will be located. <br>
Step 4: Drag the following files from this directory into the build files directory: "app.tar", "mysqldb.tar", "app-cleanup.ps1", "app-cleanup.sh", "app-start.ps1", "app-start.sh", "app-stop.ps1", "app-stop.sh". <br>

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