import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_db():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exchange_rates (
                id SERIAL PRIMARY KEY,
                from_currency VARCHAR(10),
                to_currency VARCHAR(10),
                rate NUMERIC,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            )
        ''')
        conn.commit()
        return conn, cursor
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        exit()

def save_rate_to_db(cursor, from_currency, to_currency, rate):
    try:
        cursor.execute(
            '''
            INSERT INTO exchange_rates (from_currency, to_currency, rate)
            VALUES (%s, %s, %s)
            ''',
            (from_currency, to_currency, rate)
        )
    except Exception as e:
        print(f"Error saving rate {from_currency}-{to_currency} to database: {e}")
