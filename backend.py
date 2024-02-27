import json
import requests
import os 
from datetime import timedelta, date
from dotenv import load_dotenv
from flask import Flask, jsonify

#Load environment variables 
load_dotenv()
apikey = os.getenv("")


app = Flask(__name__)

with open ("app/user_database.json", 'r') as userdb:
    db_dict = json.load(userdb)

#methods for functionality
    
def get_users(username): #return symbol list for a particular user
    try:
        return db_dict[username]
    except KeyError:
        print("User not found in database")

def get_last_weekday():
    today = date.today()
    if today.weekday() == 0:
        delta = timedelta(days=3)
    elif today.weekday() == 6:
        delta = timedelta(days=2)
    else:
        delta = timedelta(days=1)
    return (today - delta).strftime("%Y-%m-%d")

@app.route('/',methods=['GET'])
def welcome():
    return print("""Welcome to the first iteration, please use /portfolio or /portfolio/<stock>""")

@app.route('/portfolio', methods=['GET'])
def get_portfolio():
    userid = "user1"
    list_values = {}
    user_portfolio = get_users(username = userid)
    for stock in user_portfolio:
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={apikey}"
        r = requests.get(url)
        data = r.json() 
        closing_value = data["Time Series (Daily)"][get_last_weekday()]["4. close"]
        list_values[stock] = closing_value
    return jsonify(list_values)

@app.route("/portfolio/<stock>")
def get_stock_value(stock):
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={apikey}"
    r = requests.get(url)
    data = r.json()
    series = data['Time Series (Daily)']
    start_date = (date.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    end_date = date.today().strftime("%Y-%m-%d")
    filtered_data = {date: details for date, details in series.items() if start_date <= date <= end_date}   
    past_stock={}
    past_stock["symbol"]=stock
    past_stock["values_daily"]=filtered_data
    return jsonify(past_stock)

if __name__ == "__main__":
    app.run(debug = True)

    