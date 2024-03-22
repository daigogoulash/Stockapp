Credentials to test the website
username: user8

password: password


If you want to run the app locally, there needs to be a config.py file that is not loaded into the github for security reasons. This config file include the APIKEY, the credential for access to the database and the secret key for password hashing and JWT token generation. It also needs a local instantiation of a database if you plan to run it all locally, I used SQLAlechemy and SQlite to create and inspect the local database, there is also a 'mydatabase.db' file which contains the models of the database locally, but is does not have the same information (stocks, users) as the online one since changes made online do not reflect on the local db, it is just for local testing.

If you need any of these credentials don't hesistate to email me.

In order for it to work online I also ommitted the app.yaml file which also contains sensitivie info (like the API key and the secret key for JWT).