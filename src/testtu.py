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