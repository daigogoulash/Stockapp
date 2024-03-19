Credentials to test the website
username: user8
password: password

In order for the app to work locally, there needs to be a config.py file that is not loaded into the github for security reasons. This config file include the APIKEY, the credential for access to the database and the secret key for password hashing and JWT token generation. If you need any of these credentials don't hesistate to email me.

In order for it to work online I also ommitted the app.yaml file which also contains sensitivie info (like the API key and the secret key for JWT).