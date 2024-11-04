import time
import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

# Automatically download the correct ChromeDriver version
chromedriver_autoinstaller.install()

def create_driver():
    """Set up Chrome driver with options suitable for headless environments like Render."""
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')  # Necessary for running in server environments like Render
    options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems
    options.add_argument('--disable-gpu')  # Optional: May improve performance in some environments
    return webdriver.Chrome(options=options)

def select_currency(driver, element_id, currency_code):
    """Select a currency in Wise's currency dropdown using the currency code."""
    action = ActionChains(driver)
    try:
        element = driver.find_element(By.XPATH, f"//*[@id='{element_id}']")
        driver.execute_script("arguments[0].click();", element)
        action.send_keys(currency_code).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform()
        time.sleep(1)
    except Exception as e:
        print(f"Error selecting currency {currency_code} in element {element_id}: {e}")

def scrape_exchange_rate(from_currency, to_currency):
    """Scrape exchange rate between two currencies from Wise.com."""
    driver = create_driver()
    driver.get("https://wise.com/")
    time.sleep(5)  # Allow time for page to load

    try:
        select_currency(driver, 'tw-calculator-sourceSelectedCurrency', from_currency)
        select_currency(driver, 'tw-calculator-targetSelectedCurrency', to_currency)

        rate_element = driver.find_element(By.CLASS_NAME, "tw-calculator-breakdown-rate__value")
        rate = float(rate_element.text) if rate_element.text else None
    except Exception as e:
        print(f"Error retrieving rate for {from_currency} to {to_currency}: {e}")
        rate = None
    finally:
        driver.quit()

    return rate
