import time
import threading
import schedule
from utils.scraper import scrape_exchange_rate
from utils.scrapertwin import cardremit_conv, ria_conv, bnb_conv, remitly_conv
from db_config import connect_db, save_exchange_rate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def scrape_and_save_rates():
    """
    Main function to scrape exchange rates from various sources and save them to the database.
    """
    try:
        conn, cursor = connect_db()

        # Uncomment if needed
        # print("Starting CardRemit conversion rate scrape...")
        # cardremit_rates = cardremit_conv()
        # print(f"CardRemit Conversion Rates: {cardremit_rates}")

        print("Starting BNB conversion rate scrape...")
        bnb_rates = bnb_conv()
        print(f"BNB Conversion Rates: {bnb_rates}")

        print("Starting RIA conversion rate scrape...")
        ria_rates = ria_conv()
        print(f"RIA Conversion Rates: {ria_rates}")

        print("Starting Remitly conversion rate scrape...")
        remitly_rates = remitly_conv()
        print(f"Remitly Conversion Rates: {remitly_rates}")

        # Save rates to the database as required (example shown below)
        # save_exchange_rate("USD", "NGN", 410.50, "Wise Exchange")

        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error during scraping and saving: {e}")

def run_worker():
    """
    Schedules the scraping task to run every hour.
    """
    schedule.every(1).hours.do(scrape_and_save_rates)

    print("Worker started. Scraping will run every 1 hour.")
    while True:
        schedule.run_pending()
        time.sleep(1)  # Sleep to prevent busy-waiting

def start_worker_thread():
    """
    Start the worker in a background thread.
    """
    worker_thread = threading.Thread(target=run_worker)
    worker_thread.daemon = True  # Daemon thread to ensure it stops when the main program exits
    worker_thread.start()

if __name__ == "__main__":
    print("Starting the exchange rate worker...")
    start_worker_thread()

    # Keep the main thread alive
    while True:
        time.sleep(60)
