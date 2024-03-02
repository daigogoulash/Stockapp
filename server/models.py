from config import db

#db model for the users
class UserProfile(db.Model):   
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(50), unique = False, nullable = False)
    stocks = db.relationship('Stock', backref= 'user', lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "stocks": [stock.to_json() for stock in self.stocks],
        }


#db model for the stocks of each user  
class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'), nullable=False)

    def to_json(self):
        return{
            "id": self.id,
            "symbol": self.symbol,
            "quantity": self.quantity,
        }