import json
import requests
import os 
import logging
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from config import app, db
from models import UserProfile, Stock

load_dotenv()
apikey = os.getenv("")

def get_stock_value(symbol, api_key): #get stock info
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey={api_key}"
    try:
        response = requests.get(url)
        data = response.json()

        if 'Time Series (5min)' in data:
            latest_datetime = max(data['Time Series (5min)']) #filter info to only last value
            return float(data['Time Series (5min)'][latest_datetime]['4. close']) 
        elif "Note" in data: #error handling
            logging.warning(f"API call frequency exceeded for symbol {symbol}")
        elif "Error Message" in data:
            logging.error(f"Invalid API call for symbol {symbol}")
        else:
            logging.error(f"Unexpected response structure for symbol {symbol}: {data}")
    except Exception as e:
        logging.error(f"Error fetching stock data for {symbol}: {str(e)}")

    return None

def get_monthly_stock_data(symbol, api_key, start_date=None, end_date=None):
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={api_key}"
    response = requests.get(url)
    data = response.json()

    monthly_data = {}
    if 'Monthly Time Series' in data:
        # Sort and filter the dates based on start_date and end_date
        for date_str in sorted(data['Monthly Time Series'].keys()):
            if start_date and datetime.strptime(date_str, '%Y-%m-%d') < start_date:
                continue
            if end_date and datetime.strptime(date_str, '%Y-%m-%d') > end_date:
                continue
            
            monthly_data[date_str] = data['Monthly Time Series'][date_str]['4. close']

    else:
        # Handle cases where the expected data is not in the response
        pass

    return monthly_data




#get users 
@app.route("/users", methods = ["GET"]) 
def getusers():
        users = UserProfile.query.all()
        json_users = list(map(lambda x: x.to_json(), users))
        return jsonify ({"users": json_users})



@app.route('/update', methods=['GET'])
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

@app.route('/create_user', methods=['POST']) #new user data needs to be added as json
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


@app.route('/update_user/<username>', methods=['PUT']) #all new data nedds to be passed as JSON
def update_user(username):
    try:
        #find the existing user
        user = UserProfile.query.filter_by(username=username).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Parse data from the request
        data = request.json
        updated_stocks_data = data.get('stocks', {})  #dictionary of stock symbols and quantities

        #update stocks for this user
        for symbol, quantity in updated_stocks_data.items():
            stock = Stock.query.filter_by(user_id=user.id, symbol=symbol).first()
            if stock:
                stock.quantity = quantity
            else:
                #add new stock if it doesn't exist
                new_stock = Stock(symbol=symbol, quantity=quantity, user_id=user.id)
                db.session.add(new_stock)

        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/portfolio/<username>', methods=['GET'])
def user_portfolio(username):
    try:
        user = UserProfile.query.filter_by(username=username).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        portfolio = {}
        total_portfolio_value = 0

        for stock in user.stocks:
            stock_value = get_stock_value(stock.symbol, apikey)
            print(stock_value)
            # Check if stock_value is a float before proceeding
            if stock_value:
                individual_stock_value = stock.quantity * stock_value
                portfolio[stock.symbol] = {
                    "quantity": stock.quantity,
                    "current price": stock_value,
                    "value": individual_stock_value,
                }
                total_portfolio_value += individual_stock_value
            else:
                # Handle the case where stock_value is not a float (e.g., an error message)
                portfolio[stock.symbol] = {
                    "quantity": stock.quantity,
                    "current price": "Unavailable",
                    "value": "Unavailable",
                }

        return jsonify({"username": username,
                        "portfolio": portfolio,
                        "total_portfolio_value": total_portfolio_value
                        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/portfolio/<username>/<stock_symbol>", methods=["GET"])
def monthly_values(username, stock_symbol):
    try:
        user = UserProfile.query.filter_by(username=username).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if the specified stock is in the user's portfolio
        stock = next((s for s in user.stocks if s.symbol == stock_symbol), None)
        if not stock:
            return jsonify({"message": "Stock not found in user's portfolio"}), 404

        # Fetch monthly stock data
        stock_value = get_monthly_stock_data(stock.symbol, apikey)
        if stock_value:
            return jsonify({"stock_data": stock_value})
        else:
            return jsonify({"message": "Stock data not available"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/stock/<stock_symbol>", methods=["GET"])
def historical_values(stock_symbol):
    try:
        # Retrieve start and end date from request arguments
        start_date = request.args.get('start')
        end_date = request.args.get('end')

        # Optional: Convert the dates from string to datetime objects
        # (This step depends on how your get_monthly_stock_data function expects the dates)
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        # Fetch stock data for the specified date range
        stock_value = get_monthly_stock_data(stock_symbol, apikey, start_date, end_date)
        
        if stock_value:
            return jsonify({"stock_data": stock_value})
        else:
            return jsonify({"message": "Stock data not available"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# @app.route("/stock/<stock_symbol>", methods=["GET"])
# def historical_values(stock_symbol):
#     try:
#         # Fetch monthly stock data. Replace `get_monthly_stock_data` and `apikey` with your actual function and API key
#         stock_value = get_monthly_stock_data(stock_symbol, apikey)
#         if stock_value:
#             return jsonify({"stock_data": stock_value})
#         else:
#             return jsonify({"message": "Stock data not available"}), 404

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    with app.app_context(): #instantiate db
        db.create_all() #create model if it hasn't been created 

    load_dotenv()
    apikey = os.getenv("ALPHA_VANTAGE_KEY")

    app.run(debug = True)

app = Flask(__name__)
