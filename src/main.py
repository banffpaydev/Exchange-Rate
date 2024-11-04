
# ---

### `src/main.py`

# This is the main script that initializes the scraping workflow:

# ```python
import time
from utils.scraper import scrape_exchange_rate
from db_config import connect_db, save_rate_to_db
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
                    # save_rate_to_db(cursor, from_currency, to_currency, rate)
                    print(f"{from_currency} to {to_currency}: {rate}")
                time.sleep(1)

    # Commit and close the connection
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
