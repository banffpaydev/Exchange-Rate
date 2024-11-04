import time
import threading
from utils.scraper import scrape_exchange_rate
from db_config import connect_db, save_rate_to_db
from flask import Flask, jsonify
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

def main():
    # Connect to the database
    conn, cursor = connect_db()

    # Define currencies
    from_list = ['CAD', 'USD', 'GBP', 'EUR', 'CNY', 'AED']
    to_list = ['CAD', 'USD', 'GBP', 'EUR', 'CNY', 'AED', 'NGN']

    # Scrape and save exchange rates
    for from_currency in from_list:
        for to_currency in to_list:
            if from_currency != to_currency:
                rate = scrape_exchange_rate(from_currency, to_currency)
                if rate is not None:
                    save_rate_to_db(cursor, from_currency, to_currency, rate)
                    print(f"{from_currency} to {to_currency}: {rate}")
                time.sleep(1)  # Delay between each request

    # Commit and close the connection
    conn.commit()
    cursor.close()
    conn.close()

def run_main_interval():
    interval = int(os.getenv("INTERVAL", 600))  # Interval set to 10 mins (600 seconds) by default
    while True:
        print("Starting rate scrape process...")
        main()
        print(f"Process completed. Sleeping for {interval} seconds.")
        time.sleep(interval)

# Start the main scraping function in a background thread
scraping_thread = threading.Thread(target=run_main_interval)
scraping_thread.daemon = True  # Daemon thread to close when main program exits
scraping_thread.start()

# Define a simple endpoint to keep the Flask app running
@app.route("/")
def index():
    return jsonify({"message": "Exchange rate scraper is running."})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))  # Port set by Render or defaults to 5000
    app.run(host="0.0.0.0", port=port)
