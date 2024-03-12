from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Sequence
from sqlalchemy.schema import Identity
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()
class UserProfile(db.Model):   
    id = db.Column(db.Integer,Identity(start=1, cycle=False), primary_key=True) #added identity in this
    username = db.Column(db.String(50), unique=False, nullable=False)
    password_hash = db.Column(db.String(128))  # New field for storing hashed passwords
    stocks = db.relationship('Stock', backref='user', lazy=True)

    def set_password(self, password):
        """Create a hashed password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check the hashed password."""
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "stocks": [stock.to_json() for stock in self.stocks],
        }


#db model for the stocks of each user  
class Stock(db.Model):
    id = db.Column(db.Integer, db.Identity(start=1, cycle=False), primary_key=True) #Alos added identity here
    symbol = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'), nullable=False)

    def to_json(self):
        return{
            "id": self.id,
            "symbol": self.symbol,
            "quantity": self.quantity,
        }