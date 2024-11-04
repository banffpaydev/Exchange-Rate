from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
import time
import chromedriver_autoinstaller

# Automatically download the correct ChromeDriver version
chromedriver_autoinstaller.install()

def create_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    return webdriver.Chrome(options=options)

def scrape_exchange_rates(from_currency, to_currency):
    driver = create_driver()
    driver.get("https://wise.com/")
    time.sleep(5)  # Allow time for page to load

    def select_currency(element_id, currency_code):
        action = ActionChains(driver)
        element = driver.find_element(By.XPATH, f"//*[@id='{element_id}']")
        driver.execute_script("arguments[0].click();", element)
        action.send_keys(currency_code).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform()
        time.sleep(1)

    try:
        select_currency('tw-calculator-sourceSelectedCurrency', from_currency)
        select_currency('tw-calculator-targetSelectedCurrency', to_currency)

        rate_element = driver.find_element(By.CLASS_NAME, "tw-calculator-breakdown-rate__value")
        rate = float(rate_element.text) if rate_element.text else None
    except Exception as e:
        print(f"Error retrieving rate for {from_currency} to {to_currency}: {e}")
        rate = None
    finally:
        driver.quit()

    return rate
