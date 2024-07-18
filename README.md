# pwmanager-basic
This is a password management web application made for testing purposes. The front end uses basic Web3(HTML, CSS, and Javascript) and the backend uses Node.js + MySQL. This app has everything you woud expectfrom a password management application including an account system (registration + login), and aGUI where passwords for different accounts can be managed.

# How to setup
Step 1: Ensure that Node.js and MySQL are installed. You must also ensure that the MySQL service is running.
Step 2: Log into MySQL as root and run databaseinit.sql. This will set up the database, the tables, and the account used by the backend to log into the database. If you want to change the password of this account, go to line 23 of databaseinit.sql and find a string that says 'YOUR-PASSWORD-HERE' and change it to the password you want, then go to backend.js at line 21 and change the string that says "YOUR-PASSWORD-HERE" to the password you set in databaseinit.sql.
Step 3: Run "npm install" in the repository directory. This will install the prerequisite modules required for the backend to run.
Step 4: Run "node backend.js" to start the application.
