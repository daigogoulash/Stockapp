import json
import requests
import os 
from datetime import timedelta, date
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from config import app, db
from models import UserProfile, Stock


#get users 
@app.route("/users", methods = ["GET"]) 
def getusers():
        users = UserProfile.query.all()
        json_users = list(map(lambda x: x.to_json(), users))
        return jsonify ({"users": json_users})



@app.route('/add_or_update_users', methods=['GET'])
def add_or_update_users():
    with open('new_user_db.json', 'r') as file:
        data = json.load(file)

    for username, stocks in data.items():
        user = UserProfile.query.filter_by(username=username).first()
        if not user:
            user = UserProfile(username=username)
            db.session.add(user)
            db.session.commit()

        #Update or add stock information
        for symbol, quantity in stocks.items():
            stock = Stock.query.filter_by(user_id=user.id, symbol=symbol).first()
            if stock:
                stock.quantity = quantity
            else:
                new_stock = Stock(symbol=symbol, quantity=quantity, user_id=user.id)
                db.session.add(new_stock)

    try:
        db.session.commit()
        return "Users and stocks added/updated successfully", 200
    except Exception as e:
        db.session.rollback()
        return f"An error occurred: {str(e)}", 500


from flask import request, jsonify

@app.route('/create_user', methods=['POST']) #new user data nedds to be added as json
def create_user():
    try:
        #parse data from the request
        data = request.json
        username = data['username']
        stocks_data = data.get('stocks', {})  #dictionary of stock symbols and quantities

        #create new user
        new_user = UserProfile(username=username)
        db.session.add(new_user)
        db.session.commit()

        #add stocks for this user
        for symbol, quantity in stocks_data.items():
            new_stock = Stock(symbol=symbol, quantity=quantity, user_id=new_user.id)
            db.session.add(new_stock)

        db.session.commit()
        return jsonify({"message": "User and stocks added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    with app.app_context(): #instantiate db
        db.create_all() #create model if it hasn't been created 


    app.run(debug = True)







app = Flask(__name__)

#configure this to my database
app.config['SQLALCHEMY_DATABASE_URI'] = 'path/to/your/db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# #Load environment variables 
load_dotenv()
apikey = os.getenv("")




# #methods for functionality
    
# def get_last_weekday():
#     today = date.today()
#     if today.weekday() == 0:
#         delta = timedelta(days=3)
#     elif today.weekday() == 6:
#         delta = timedelta(days=2)
#     else:
#         delta = timedelta(days=1)
#     return (today - delta).strftime("%Y-%m-%d")

# @app.route('/',methods=['GET'])
# def welcome():
#     return print("""Welcome to the first iteration, please use /portfolio or /portfolio/<stock>""")

# @app.route('/portfolio', methods=['GET'])
# def get_portfolio():
#     userid = "user1"
#     list_values = {}
#     user_portfolio = get_users(username = userid)
#     for stock in user_portfolio:
#         url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={apikey}"
#         r = requests.get(url)
#         data = r.json() 
#         closing_value = data["Time Series (Daily)"][get_last_weekday()]["4. close"]
#         list_values[stock] = closing_value
#     return jsonify(list_values)

# @app.route("/portfolio/<stock>")
# def get_stock_value(stock):
#     url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={apikey}"
#     r = requests.get(url)
#     data = r.json()
#     series = data['Time Series (Daily)']
#     start_date = (date.today() - timedelta(days=30)).strftime("%Y-%m-%d")
#     end_date = date.today().strftime("%Y-%m-%d")
#     filtered_data = {date: details for date, details in series.items() if start_date <= date <= end_date}   
#     past_stock={}
#     past_stock["symbol"]=stock
#     past_stock["values_daily"]=filtered_data
#     return jsonify(past_stock)



    