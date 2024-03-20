import json
import requests 
import logging
from datetime import datetime
import datetime
from flask import Flask, jsonify, request
from config import app, db, un, pw, dsn, apikey
from models import UserProfile, Stock
import jwt
from functools import wraps
import requests
from flask_cors import CORS
from sqlalchemy.pool import NullPool
import oracledb

CORS(app)  #avoid cross origin errors
#sensitive db and passkey info passed down to config.py file not in the github

pool = oracledb.create_pool(user=un, password=pw, 
                            dsn=dsn)

app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
app.config['SQLALCHEMY_ECHO'] = True
db.init_app(app)

with app.app_context():
    db.create_all()




def token_required(f): #token validation for secure access
    @wraps(f) #preserve the original function's metadata
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization') 
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403

        if token.startswith('Bearer '):
            token = token.split(" ")[1]  #remove the "Bearer " prefix

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"]) #decode the token with secret key
            current_user = UserProfile.query.filter_by(username=data['sub']).first()
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.DecodeError:
            return jsonify({'message': 'Error decoding token'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)

    return decorated #return the decorated function


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
        #sort and filter the dates based on start_date and end_date
        for date_str in sorted(data['Monthly Time Series'].keys()):
            if start_date and datetime.strptime(date_str, '%Y-%m-%d') < start_date:
                continue
            if end_date and datetime.strptime(date_str, '%Y-%m-%d') > end_date:
                continue
            
            monthly_data[date_str] = data['Monthly Time Series'][date_str]['4. close']

    else:
        #handle cases where the expected data is not in the response
        pass

    return monthly_data






@app.route('/create_user', methods=['POST']) #check to see if this works, not implemented into page yet
def create_user():
    try:
        data = request.json
        username = data['username']
        password = data['password']  #get the password from the request
        new_user = UserProfile(username=username)
        new_user.set_password(password)  #hash the password
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User and stocks added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/login', methods=['POST']) #adding token validation
def login():
    data = request.json
    user = UserProfile.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        #generate JWT Token
        token = jwt.encode({
            'sub': user.username,
            'iat': datetime.datetime.utcnow(),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  #token expires in 1 hour
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            "success": True, 
            "message": "Logged in successfully",
            "token": token #send the token back to the client
        }), 200
    else:
        #authentication failed
        return jsonify({"success": False, "message": "Invalid username or password"}), 401




@app.route('/update_user', methods=['PUT']) #route to update users portfolio, add remove stocks
@token_required #this means that the user must be logged in to access this route
def update_user(current_user):
    try:
        data = request.json
        updated_stocks_data = data.get('stocks', {})

        for symbol, quantity in updated_stocks_data.items():
            stock = Stock.query.filter_by(user_id=current_user.id, symbol=symbol).first()

            if quantity == 0:
                #remove stock if quantity is zero
                if stock:
                    db.session.delete(stock)
            else:
                if stock:
                    #update existing stock
                    stock.quantity = quantity
                else:
                    #add new stock
                    new_stock = Stock(symbol=symbol, quantity=quantity, user_id=current_user.id)
                    db.session.add(new_stock)

        db.session.commit()
        return jsonify({"message": "User portfolio updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Exception: {e}", exc_info=True)  #log the full exception
        return jsonify({"error": str(e)}), 500




@app.route('/api/portfolio', methods=['GET']) 
@token_required
def user_portfolio(current_user):
    try:
        portfolio = {}
        total_portfolio_value = 0

        for stock in current_user.stocks:
            stock_value = get_stock_value(stock.symbol, apikey)
            #check if stock value is available
            if stock_value:
                individual_stock_value = stock.quantity * stock_value
                portfolio[stock.symbol] = {
                    "quantity": stock.quantity,
                    "current price": stock_value,
                    "value": individual_stock_value,
                }
                total_portfolio_value += individual_stock_value
            else:
                #handle cases where stock value is not available
                portfolio[stock.symbol] = {
                    "quantity": stock.quantity,
                    "current price": "Unavailable",
                    "value": "Unavailable",
                }

        return jsonify({
            "username": current_user.username,
            "portfolio": portfolio,
            "total_portfolio_value": total_portfolio_value
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/portfolio/<stock_symbol>", methods=["GET"]) #changed to api/portfolio/stock
def historical_values(stock_symbol):
    try:
        #retrieve start and end date from request arguments
        start_date = request.args.get('start')
        end_date = request.args.get('end')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        #fetch stock data for the specified date range
        stock_value = get_monthly_stock_data(stock_symbol, apikey, start_date, end_date)
        
        if stock_value:
            return jsonify({"stock_data": stock_value})
        else:
            return jsonify({"message": "Stock data not available"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

if __name__ == "__main__":
    app.run(debug = True)

