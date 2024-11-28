import time
import threading
import schedule
import asyncio
from concurrent.futures import ThreadPoolExecutor
from utils.scrapertwin import ria_conv, bnb_conv, remitly_conv
from db_config import connect_db, save_exchange_rate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Global variable to track running tasks
current_tasks = []

async def scrape_and_save_rates():
    """
    Main function to scrape exchange rates asynchronously and save them to the database.
    """
    loop = asyncio.get_event_loop()

    try:
        conn, cursor = connect_db()

        with ThreadPoolExecutor() as executor:
            # print("Starting RIA conversion rate scrape...")
            # ria_task = loop.run_in_executor(executor, ria_conv)

            print("Starting BNB conversion rate scrape...")
            bnb_task = loop.run_in_executor(executor, bnb_conv)

            print("Starting Remitly conversion rate scrape...")
            remitly_task = loop.run_in_executor(executor, remitly_conv)

            # Run all tasks concurrently ria_task,
            tasks = [bnb_task, remitly_task]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Log the results
            for result in results:
                if isinstance(result, Exception):
                    print(f"Error during scraping task: {result}")
                else:
                    print(f"Scraping Result: {result}")

            # Example save to DB
            # save_exchange_rate(...)
            # conn.commit()

        # cursor.close()
        # conn.close()

    except Exception as e:
        print(f"Error during scraping and saving: {e}")

async def schedule_scraping():
    """
    Schedule the scrape_and_save_rates function to run every hour,
    ensuring any currently running tasks are forcefully stopped.
    """
    global current_tasks
    while True:
        # Cancel currently running tasks
        for task in current_tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                print("Previous scraping task cancelled.")

        # Start a new scraping task
        new_task = asyncio.create_task(scrape_and_save_rates())
        current_tasks = [new_task]

        await asyncio.sleep(3600)  # Sleep for 1 hour

def run_worker():
    """
    Run the asynchronous scheduler in an event loop.
    """
    asyncio.run(schedule_scraping())

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
        time.sleep(1)
