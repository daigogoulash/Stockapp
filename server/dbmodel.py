from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

#Base model, this needs to be changed for future iterations

class Userprofile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    def dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id
        }