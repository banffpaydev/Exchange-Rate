import time
import threading
from utils.scraper import scrape_exchange_rate
from utils.scrapertwin import cardremit_conv, ria_conv, bnb_conv, remitly_conv
from db_config import connect_db, save_rate_to_db
from flask import Flask, jsonify
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

def main():
    """
    Main function to perform exchange rate scraping from various sources.
    """
    conn, cursor = connect_db()

    # Uncomment if needed
    # print("Starting CardRemit conversion rate scrape...")
    # cardremit_rates = cardremit_conv()
    # print(f"CardRemit Conversion Rates: {cardremit_rates}")

    print("Starting BNB conversion rate scrape...")
    bnb_rates = bnb_conv(cursor)
    print(f"BNB Conversion Rates: {bnb_rates}")

    print("Starting RIA conversion rate scrape...")
    ria_rates = ria_conv(cursor)
    print(f"RIA Conversion Rates: {ria_rates}")

    print("Starting Remitly conversion rate scrape...")
    remitly_rates = remitly_conv()
    print(f"Remitly Conversion Rates: {remitly_rates}")

    conn.commit()
    cursor.close()
    conn.close()

def run_main_interval():
    """
    Runs the main function at intervals specified by the INTERVAL environment variable.
    """
    interval = int(os.getenv("INTERVAL", 600))  # Default to 10 minutes if not set
    while True:
        try:
            print("Starting rate scrape process...")
            main()
            print(f"Process completed. Sleeping for {interval} seconds.")
        except Exception as e:
            print(f"Error occurred during scraping: {e}")
        time.sleep(interval)

# Start the main scraping function in a background thread
def start_scraping_thread():
    scraping_thread = threading.Thread(target=run_main_interval)
    scraping_thread.daemon = True  # Daemon thread to close when main program exits
    scraping_thread.start()

# Define a simple endpoint to keep the Flask app running
@app.route("/")
def index():
    return jsonify({"message": "Exchange rate scraper is running."})

# WSGI server (Gunicorn) will call app by default
if __name__ != "__main__":
    start_scraping_thread()

if __name__ == "__main__":
    # Only for local development
    port = int(os.getenv("PORT", 5000))  # Port set by Render or defaults to 5000
    start_scraping_thread()  # Ensure scraping starts in development mode
    app.run(host="0.0.0.0", port=port)
