import time
# import chromedriver_autoinstaller
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException, WebDriverException, TimeoutException
import logging
import warnings 
warnings.filterwarnings('ignore')

# Automatically download the correct ChromeDriver version
# chromedriver_autoinstaller.install()


# list of currencies
from_list=['CAD', 'USD', 'GBP','EUR','CNY', 'AED']
to_list=['CAD', 'USD', 'GBP','EUR','CNY', 'AED','NGN', 'SLE', 'GHS', 'AOA']

wise_from_list=['CAD', 'USD', 'GBP','EUR','CNY', 'AED']
wise_to_list=['CAD', 'USD', 'GBP','EUR','CNY', 'AED','NGN', 'GHS']

# ALL Hardcoded numbers are number that the remittance site assigns to target countries.
lemfi_hardcoded_to_list_dict={'CAD':[2,5,9,16], 'USD':[2,5,9,16], 'GBP':[2,5,9,16]}
lemfi_hardcoded_from_list_dict={1:'CAD', 2:'GBP', 3:'USD'}

remitly_from_list=['ca', 'us', 'gb','de','ae']
remitly_to_list=['canada', 'united-states', 'united-kingdom','germany','china', 'nigeria', 'sierra-leone', 'ghana']
remitly_to_dict={'canada':'ca', 'united-states':'us', 'united-kingdom':'gb','germany':'de','china':'cny', 'nigeria':'ngn', 'sierra-leone':'sle', 'ghana':'ghs'}

# ALL Hardcoded numbers are number that the remittance site assigns to target countries.
# For BNB Target ID in the Drop Down [1-EURO, 12-GHS, 23-NGN, 28-SLE, 34-GBP, 35-USD, 5-CAD];  
bnb_hardcoded_to_list_dict={'CAD':[1,12,23,28,34, 35], 'USD':[1,5,13,24,29, 35]}
bnb_hardcoded_from_list_dict={1:'CAD', 5:'USD'}


ria_from_list=['ca', 'us', 'gb','de']
ria_hardcoded_to_list_dict={'ca':[168,167,65,38,166, 122, 142, 66, 10], 'us':[33,167,65,38,166, 122, 142, 66, 10], 
                            'gb':[168,33,65,38,166, 122, 142, 66, 10], 'de':[168,167,33,38,166, 122, 142, 66, 10]}
ria_hardcoded_from_list_dict={'ca': 'CAD', 'us': 'USD', 'gb': 'GBP','de': 'EUR'}

cardremti_from_list=['CAD']
cardremti_to_list=['NGN']

# final df
rate_list_f=[]

for i in from_list:
    for j in to_list:
        if i!=j:
            from_to_curr= str(i)+'-'+str(j)
            rate_list_f.append(from_to_curr)

rate_df=pd.DataFrame(rate_list_f, columns=['source_target'])
rate_df['run_time']=time.strftime("%Y-%m-%d %H:%M:%S")





# HardCodes nding here



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



def cardremit_conv():
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    conv_rate_list = []

    # Initialize the WebDriver with error handling
    try:
        driver = create_driver()  # Assume create_driver() initializes the driver with desired options
        driver.get("https://cadremit.com/")
        time.sleep(5)

        # Retry mechanism for fetching conversion rate
        retry_attempts = 3
        for attempt in range(retry_attempts):
            try:
                # Perform clicks and retrieve the conversion rate
                element = driver.find_element(By.XPATH, "//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[1]/div[2]/div/div")
                driver.execute_script("arguments[0].click();", element)
                time.sleep(1)

                element = driver.find_element(By.XPATH, "//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[1]/div[2]/div/ul/li[2]")
                driver.execute_script("arguments[0].click();", element)
                time.sleep(1)

                element = driver.find_element(By.XPATH, "//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[3]/div[2]/div/div")
                driver.execute_script("arguments[0].click();", element)
                time.sleep(1)

                element = driver.find_element(By.XPATH, "//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[3]/div[2]/div/ul/li[1]")
                driver.execute_script("arguments[0].click();", element)

                # Capture conversion rate
                conv_rate = driver.find_element(By.XPATH, "//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[2]/div[2]/div[2]/span[1]").text
                conv_rate_list.append(conv_rate)
                break  # Exit the loop if successful

            except NoSuchElementException as e:
                logger.error(f"Element not found on attempt {attempt + 1}: {e}")
                driver.get("https://cadremit.com/")
                time.sleep(10)
            except WebDriverException as e:
                logger.error(f"WebDriver error on attempt {attempt + 1}: {e}")
                time.sleep(5)
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
                time.sleep(5)
        else:
            logger.warning("Failed to retrieve conversion rate after multiple attempts.")
        
    except WebDriverException as e:
        logger.critical(f"Failed to initialize WebDriver: {e}")
    finally:
        # Ensure the driver is closed to release resources
        if 'driver' in locals():
            driver.quit()

    return conv_rate_list


# ria function
def ria_conv():
    driver = create_driver()
    conv_rate_list = []
    
    for i in ria_from_list:
        y_f2 = True
        retry_count = 0
        max_retries = 3  # Define a maximum number of retries for loading the URL

        while y_f2 and retry_count < max_retries:
            try:
                url = f"https://www.riamoneytransfer.com/en-{i}/"
                driver.get(url)
                time.sleep(5)  # Consider using WebDriverWait for better handling
                y_f2 = False
            except TimeoutException as e:
                logging.error(f"Timeout while loading {url}: {e}")
                retry_count += 1
                time.sleep(2)  # Wait before retrying
            except Exception as e:
                logging.error(f"Error while loading {url}: {e}")
                break  # Break out of the loop on unexpected errors

        for j in ria_hardcoded_to_list_dict[i]:
            y_f = True
            retry_count = 0

            while y_f and retry_count < max_retries:
                try:
                    driver.find_element(By.CLASS_NAME, "dropdown-container").click()
                    time.sleep(1)

                    dropdown_id = f"//*[@id='__next']/main/section[1]/div/div/div[2]/div/div/form/div[1]/div/div/div/div/ul/li[{j}]"
                    driver.find_element(By.XPATH, dropdown_id).click()
                    time.sleep(1)

                    # Try to get the conversion rate
                    try:
                        promo_rate = driver.find_element(By.CLASS_NAME, "text-promo-rate").text
                        if promo_rate not in ['-', '_', '=', ' ']:
                            logging.info(f'1.00 {ria_hardcoded_from_list_dict[i]} = {promo_rate}')
                            conv_rate_list.append(f'1.00 {ria_hardcoded_from_list_dict[i]} = {promo_rate}')
                            y_f = False
                    except NoSuchElementException:
                        transfer_text = driver.find_element(By.CLASS_NAME, "transfer-text").text.split(ria_hardcoded_from_list_dict[i])[-1]
                        logging.info(f'1.00 {ria_hardcoded_from_list_dict[i]} = {transfer_text}')
                        conv_rate_list.append(f'1.00 {ria_hardcoded_from_list_dict[i]} = {transfer_text}')
                        y_f = False

                except NoSuchElementException as e:
                    logging.error(f"Element not found when processing dropdown for {i}: {e}")
                    driver.get(url)
                    time.sleep(5)  # Re-load the page on error
                    retry_count += 1  # Increment retry count
                except Exception as e:
                    logging.error(f"Unexpected error when processing dropdown for {i}: {e}")
                    break  # Exit loop on unexpected errors

    # Close the driver
    driver.quit()  # Use quit to ensure clean exit

    return conv_rate_list


## bnb function
def bnb_conv():
    conv_rate_list = []

    try:
        # Initialize the driver
        driver = create_driver()

        driver.get("https://web.bnbcash.app/en")
        time.sleep(5)

        for i in bnb_hardcoded_from_list_dict.keys():
            success = False
            while not success:
                try:
                    driver.find_element(By.XPATH, "/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[1]/div[2]/div[1]/span").click()
                    time.sleep(1)

                    dropdown_id1 = f"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[1]/div[2]/div[2]/div/div[{i}]/div/span"
                    driver.find_element(By.XPATH, dropdown_id1).click()
                    time.sleep(1)

                    length_list = len(bnb_hardcoded_to_list_dict[bnb_hardcoded_from_list_dict[i]])

                    for j in range(length_list):
                        country_success = False
                        while not country_success:
                            try:
                                driver.find_element(By.XPATH, "/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[2]/div[2]/div[1]/span").click()
                                time.sleep(1)
                                country_num = bnb_hardcoded_to_list_dict[bnb_hardcoded_from_list_dict[i]][j]
                                dropdown_id2 = f"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[2]/div[2]/div[2]/div/div[{country_num}]/div/span"
                                driver.find_element(By.XPATH, dropdown_id2).click()
                                time.sleep(1)

                                conv_rate = driver.find_element(By.XPATH, "/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text
                                logging.info(f"Conversion rate found: {conv_rate}")
                                conv_rate_list.append(conv_rate)
                                country_success = True
                            except NoSuchElementException as e:
                                logging.error(f"Element not found during country selection: {e}")
                                break  # Break out to the main loop to try again

                    success = True
                
                except NoSuchElementException as e:
                    logging.error(f"Element not found during conversion selection: {e}")
                    break  # Break out to the main loop to try again

    except WebDriverException as e:
        logging.error(f"WebDriver error: {e}")

    finally:
        # Ensure the driver is closed even if an error occurs
        if driver:
            driver.quit()

    return conv_rate_list



## remitly functions
def remitly_conv():
    remitly_list = []
    driver = create_driver()

    for i in remitly_from_list:
        for j in remitly_to_list:
            if remitly_to_dict[j] != i:
                y_f = True
                attempt = 0  # Track the number of attempts

                while y_f and attempt < 3:  # Limit to 3 attempts
                    try:
                        url = f"https://www.remitly.com/{i}/en/{j}"
                        driver.get(url)

                        if attempt == 0:
                            driver.find_element(By.XPATH, "//*[@id='c-footerBrandV1']/footer/div[2]/div/div[2]/div[3]/button[2]").click()
                            time.sleep(2)

                        time.sleep(2)  # Wait for the rate to load
                        rate = driver.find_element(By.XPATH, "//*[@id='send-recv-calc-container']/div[3]/div/div/div[2]").text
                        remitly_list.append(rate)
                        logging.info(f"Retrieved rate for {i} to {j}: {rate}")
                        y_f = False  # Exit the loop on success

                    except Exception as e:
                        attempt += 1  # Increment attempt count
                        logging.error(f"Error retrieving rate for {i} to {j} on attempt {attempt}: {e}")
                        time.sleep(5)  # Wait before retrying
                        if attempt == 3:  # Log final failure after 3 attempts
                            logging.error(f"Failed to retrieve rate for {i} to {j} after {attempt} attempts.")

    # Close the driver
    driver.quit()
    return remitly_list






## Wise functions
def source_currency_tab(driver, curr):
    y_f=True
    action1 = ActionChains(driver)
    while y_f:
        try:
            element=driver.find_element(By.XPATH,"//*[@id='tw-calculator-sourceSelectedCurrency']")
            driver.execute_script("arguments[0].click();", element)
            action1.send_keys(curr)
            action1.send_keys(Keys.TAB)
            action1.send_keys(Keys.ENTER)
            action1.perform()
            time.sleep(1)
            if driver.find_element(By.XPATH,"//*[@id='tw-calculator-sourceSelectedCurrency']").text==curr:
                y_f=False
            else:
                driver.get("https://wise.com/")
        except:
            time.sleep(5)
            driver.get("https://wise.com/")
            pass
#################################

def target_currency_tab(driver, source_curr, target_curr):
    y_f=True
    action1 = ActionChains(driver)
    while y_f:
        try:
            element=driver.find_element(By.XPATH,"//*[@id='tw-calculator-targetSelectedCurrency']")
            driver.execute_script("arguments[0].click();", element)
            action1.send_keys(target_curr)
            action1.send_keys(Keys.TAB)
            action1.send_keys(Keys.ENTER)
            action1.perform()
            time.sleep(1)

            if driver.find_element(By.XPATH,"//*[@id='tw-calculator-targetSelectedCurrency']").text==target_curr:
                y_f=False
            else:
                driver.get("https://wise.com/")
                source_currency_tab(driver, source_curr)
        except:
            time.sleep(5)
            driver.get("https://wise.com/")
            pass



def wise_conv():

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)


    rate_dict=dict()
    rate=''

    # web page url
    driver.get("https://wise.com/")
    driver.maximize_window()

    time.sleep(5)

    for i in wise_from_list:
        source_currency_tab(driver, i)
        for j in wise_to_list:
            if i.strip()!=j.strip():
                target_currency_tab(driver, i, j)

                cnt=0
                y_f=True
                while (y_f and cnt<5):
                    try:
                        if ((driver.find_element(By.CLASS_NAME, "tw-calculator-breakdown-rate__value").text!='')):
                            rate=driver.find_element(By.CLASS_NAME, "tw-calculator-breakdown-rate__value").text
                            y_f=False
                            time.sleep(1)
                        else:
                            print('Wait for updating the URL!')
                            time.sleep(5)
                            cnt+=1
                    except:
                        pass

                
                if cnt>=5:
                    print(str(i)+'-'+str(j)+'-conversion-has problem, redo later')
                    rate='NA'
                
                
                from_to_curr= str(i)+'-'+str(j)
                rate_dict[from_to_curr]= rate
                print(from_to_curr + ':' + rate)


    #close the driver
    driver.close()
    driver.quit()
    
    return rate_dict



## Lemfi functions
## hardcoded version


def lemfi_conv():

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    # web page url
    driver.get("https://www.lemfi.com/ca/international-money-transfer")
    driver.maximize_window()

    time.sleep(5)

    # Closing cookies
    driver.find_element(By.XPATH,"/html/body/div[5]/div/div[2]/div/button[2]/span[3]").click()
    time.sleep(1)


    conv_rate_list=[]

    # 1:CAD, 2:GBP, 3:USD
    # lemfi_hardcoded_to_list_dict={'CAD':[2,5,9,16], 'USD':[2,5,9,16], 'GBP':[2,5,9,16]}
    # lemfi_hardcoded_from_list_dict={1:'CAD', 2:'GBP', 3:'USD'}

    for i in lemfi_hardcoded_from_list_dict.keys():
        try:
            to_list_backup=[]
            if i==1:
                driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[1]/div[1]/div").click()
                dropdown_id=driver.find_element(By.XPATH, "//*[@id='uikit-teleport-content']/child::*").get_attribute('id')

            dropdown_id2="//*[@id='"+ dropdown_id +"']/div[" + str(i)+ "]/li/div/div"
            driver.find_element(By.XPATH,dropdown_id2).click()
            time.sleep(1)

        #  print(driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div/div/span").text)

            if (driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div/div/span").text) in from_list:

                cnt=lemfi_hardcoded_to_list_dict[lemfi_hardcoded_from_list_dict[i]][0]
                index=0
                y_f=True
                while y_f:
                    if cnt==lemfi_hardcoded_to_list_dict[lemfi_hardcoded_from_list_dict[i]][0]:
                        driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[1]/div[3]/div").click()
                        time.sleep(1)
                        second_dropdown_id=driver.find_element(By.XPATH, "//*[@id='uikit-teleport-content']/child::*").get_attribute('id')
                    
                    second_dropdown_id2="//*[@id='"+ second_dropdown_id +"']/div[" + str(cnt)+ "]"
                    try: 
                        driver.find_element(By.XPATH,second_dropdown_id2).click()
                        time.sleep(1)


                        tgt_cur_text=driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div[1]/div[1]/div[1]/div[3]/div/div/span").text
                    #   print(tgt_cur_text)
                        if ((tgt_cur_text in to_list) and (tgt_cur_text not in to_list_backup)):
                        #   print('##########')
                            print(driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[3]/div[1]/span[2]").text)
                            conv_rate_list.append(driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[3]/div[1]/span[2]").text)
                            time.sleep(1)
                            driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[1]/div[3]/div").click()

                            try:
                                index+=1
                                cnt=lemfi_hardcoded_to_list_dict[lemfi_hardcoded_from_list_dict[i]][index]
                            except:
                                break
                                


                            to_list_backup.append(tgt_cur_text)
                        #   print(to_list_backup)
                        else:
                            driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[1]/div[3]/div").click()

                            try:
                                index+=1
                                cnt=lemfi_hardcoded_to_list_dict[lemfi_hardcoded_from_list_dict[i]][index]
                            except:
                                break
                    except:
                        cnt=lemfi_hardcoded_to_list_dict[lemfi_hardcoded_from_list_dict[i]][0]
                        y_f=False
                    #   print('######################')
                        pass


                driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[1]/div[1]/div").click()
        except:
            print('The webpage is down, wait 5 minutes.')
            time.sleep(300)
            # Refresh the page
            driver.get("https://www.lemfi.com/ca/international-money-transfer")
            time.sleep(5)
            driver.find_element(By.XPATH,"//*[@id='__nuxt']/div[2]/div[1]/div[2]/div/div[1]/div[1]/div[1]/div").click()
            dropdown_id=driver.find_element(By.XPATH, "//*[@id='uikit-teleport-content']/child::*").get_attribute('id')
            pass


    #close the driver
    driver.close()
    driver.quit()

    return conv_rate_list


