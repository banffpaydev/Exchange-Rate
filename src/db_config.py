import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_db():
    """
    Establish a connection to the PostgreSQL database and ensure the exchange_rate_py table exists.
    """
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        cursor = conn.cursor()

        # Ensure the exchange_rate_py table exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exchange_rate_py (
                id SERIAL PRIMARY KEY,
                from_currency VARCHAR(10) NOT NULL,
                to_currency VARCHAR(10) NOT NULL,
                rate NUMERIC NOT NULL,
                vendor VARCHAR(50) NOT NULL,  -- Vendor column for tracking source
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE (from_currency, to_currency, vendor)
            )
        ''')

        conn.commit()
        return conn, cursor
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        exit()

def save_rate_to_db(cursor, from_currency: str, to_currency: str, rate: float, vendor: str):
    """
    Save or update the exchange rate in the database for a specific vendor.
    If a conflict occurs, the existing rate is updated.
    """
    try:
        query = '''
        INSERT INTO exchange_rate_py (from_currency, to_currency, rate, vendor)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (from_currency, to_currency, vendor) 
        DO UPDATE SET 
            rate = EXCLUDED.rate,
            timestamp = NOW()
        '''
        cursor.execute(query, (from_currency, to_currency, rate, vendor))
    except Exception as e:
        print(f"Error saving rate {from_currency}-{to_currency} to database: {e}")

async def save_exchange_rate(from_currency: str, to_currency: str, rate: float, vendor: str):
    """
    Save an exchange rate in the database, establishing a connection for each call.
    This function ensures the rate is up-to-date for a given vendor.
    """
    try:
        conn, cursor = connect_db()  # Connect to the database
        save_rate_to_db(cursor, from_currency, to_currency, rate, vendor)  # Save or update the rate
        conn.commit()  # Commit the transaction
        print(f"Saved exchange rate {from_currency} to {to_currency} at {rate} from vendor {vendor}")
    except Exception as e:
        print(f"Error saving exchange rate: {e}")
    finally:
        cursor.close()  # Close the cursor
        conn.close()  # Close the connection
