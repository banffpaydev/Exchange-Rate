import time
# import chromedriver_autoinstaller
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from db_config import connect_db, save_rate_to_db, save_exchange_rate
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
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

# ria_from_list=['gb','de']
# ria_hardcoded_to_list_dict={'gb':[168,33,65,38,166, 122, 142, 66, 10], 'de':[168,167,33,38,166, 122, 142, 66, 10]}
# ria_hardcoded_from_list_dict={'gb': 'GBP','de': 'EUR'}

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
    options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems # Needed for some environments
    options.add_argument('--disable-dev-shm-usage')  # Prevents issues on low memory environments
    options.add_argument('--disable-accelerated-2d-canvas')  # Avoids GPU rendering issues
    options.add_argument('--disable-accelerated-video-decode')
    options.add_argument('--disable-software-rasterizer')  # Disables software rasterizer
    options.add_argument('--disable-webgl') 
    options.add_argument('--disable-gpu')  # Optional: May improve performance in some  
    options.add_argument('--disable-extensions')  
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
    # options = webdriver.ChromeOptions()
    # options.add_argument('--headless')
    # driver = webdriver.Chrome(options=options)

    driver=webdriver.Chrome()

    conv_rate_list=[]

    driver.get("https://cadremit.com/")
    driver.maximize_window()
    time.sleep(5)

    y_f=True
    while y_f:
        try: 
            element=driver.find_element(By.XPATH,"//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[1]/div[2]/div/div")
            driver.execute_script("arguments[0].click();", element)
            time.sleep(1)


            element=driver.find_element(By.XPATH,"//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[1]/div[2]/div/ul/li[2]")
            driver.execute_script("arguments[0].click();", element)
            time.sleep(1)


            element=driver.find_element(By.XPATH,"//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[3]/div[2]/div/div")
            driver.execute_script("arguments[0].click();", element)
            time.sleep(1)


            element=driver.find_element(By.XPATH,"//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[3]/div[2]/div/ul/li[1]")
            driver.execute_script("arguments[0].click();", element)

            print(driver.find_element(By.XPATH,"//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[2]/div[2]/div[2]/span[1]").text)
            conv_rate_list.append(driver.find_element(By.XPATH,"//*[@id='__nuxt']/div/div[3]/div/div/div/div/div[2]/div/div[2]/div[2]/div[2]/span[1]").text)

            y_f=False

        except:
            driver.get("https://cadremit.com/")
            driver.maximize_window()
            time.sleep(10)
            pass

    #close the driver
    driver.close()
    driver.quit()

    return conv_rate_list



# ria function

# ria function
# ria function

def ria_conv():

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    driver=webdriver.Chrome()


    conv_rate_list=[]

    for i in ria_from_list:
        y_f2=True
        while y_f2:
            try:
                url="https://www.riamoneytransfer.com/en-"+i+"/"
                driver.get(url)
                # driver.maximize_window()
                time.sleep(5)
                y_f2=False
            except:
                pass
        
        for j in ria_hardcoded_to_list_dict[i]:
            y_f=True
            while y_f:
                try:
                    driver.find_element(By.CLASS_NAME,"dropdown-container").click()
                    time.sleep(1)

                    dropdown_id="//*[@id='__next']/main/section[1]/div/div/div[2]/div/div/form/div[1]/div/div/div/div/ul/li["+ str(j)+ "]"
                    driver.find_element(By.XPATH,dropdown_id).click()
                    time.sleep(1)


                    try:
                        if driver.find_element(By.CLASS_NAME,"text-promo-rate").text not in ['-','_','=', ' ']:
                            print('1.00 ' + str(ria_hardcoded_from_list_dict[i]) + ' = '+ driver.find_element(By.CLASS_NAME,"text-promo-rate").text)
                            from_currency = ria_hardcoded_from_list_dict[i]
                            xRating = driver.find_element(By.CLASS_NAME,"text-promo-rate").text
                            xRate = xRating.split()
                            to_currency = xRate[1]
                            rate = float(xRate[0])
                            save_exchange_rate(from_currency, to_currency, rate, "ria")
                            conv_rate_list.append('1.00 ' + str(ria_hardcoded_from_list_dict[i]) + ' = '+ driver.find_element(By.CLASS_NAME,"text-promo-rate").text)
                            y_f=False
                    except:
                        print('1.00 ' + str(ria_hardcoded_from_list_dict[i]) + ' = '+ driver.find_element(By.CLASS_NAME,"transfer-text").text.split(ria_hardcoded_from_list_dict[i])[-1])
                        from_currency = ria_hardcoded_from_list_dict[i]
                        xRating = driver.find_element(By.CLASS_NAME,"transfer-text").text.split(ria_hardcoded_from_list_dict[i])[-1]
                        xRate = xRating.split()
                        to_currency = xRate[1]
                        rate = float(xRate[0])
                        save_exchange_rate(from_currency, to_currency, rate, "ria")
                        # xRate = driver.find_element(By.CLASS_NAME,"transfer-text").text.split(ria_hardcoded_from_list_dict[i])[-1]
                        # print("except: ", from_currency, to_currency, rate)
                        conv_rate_list.append('1.00 ' + str(ria_hardcoded_from_list_dict[i]) + ' = '+ driver.find_element(By.CLASS_NAME,"transfer-text").text.split(ria_hardcoded_from_list_dict[i])[-1])
                        y_f=False


                except:
                    driver.get(url)
                    time.sleep(5)
                    
                    pass


    #close the driver
    driver.close()
    driver.quit()

    return conv_rate_list


# def



## bnb function

## bnb function

# def bnb_conv(cursor):

#     options = webdriver.ChromeOptions()
#     options.add_argument('--headless')
#     driver = webdriver.Chrome(options=options)

#     conv_rate_list=[]


#     driver.get("https://web.bnbcash.app/en")
#     driver.maximize_window()
#     time.sleep(5)


#     conv_rate_list=[]
#     for i in bnb_hardcoded_from_list_dict.keys():
#         y_f=True
#         while y_f:
#             try:
#                 driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[1]/div[2]/div[1]/span").click()
#                 time.sleep(1)

#                 dropdown_id1="/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[1]/div[2]/div[2]/div/div["+ str(i)+ "]/div/span"
#                 driver.find_element(By.XPATH,dropdown_id1).click()
#                 time.sleep(1)

#                 length_list=len(bnb_hardcoded_to_list_dict[bnb_hardcoded_from_list_dict[i]])
            

#                 for j in range(length_list):
#                     y_f=True
#                     while y_f:
#                         try:
        
#                             driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[2]/div[2]/div[1]/span").click()
#                             time.sleep(1)
#                             country_num=bnb_hardcoded_to_list_dict[bnb_hardcoded_from_list_dict[i]][j]
#                             dropdown_id2="/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[2]/div[2]/div[2]/div/div["+ str(country_num)+ "]/div/span"
#                             driver.find_element(By.XPATH,dropdown_id2).click()
#                             time.sleep(1)
#                             xRates = driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text
#                             print(driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text)
#                             conv_rate_list.append(driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text)

#                             from_currency = bnb_hardcoded_from_list_dict[i]
#                             to_currency = bnb_hardcoded_to_list_dict[from_currency][j]
#                             save_rate_to_db(cursor, from_currency, to_currency, float(xRates))
#                             y_f=False
#                         except:
#                             pass

#                 y_f=False
                
#             except:
#                 pass


#     #close the driver
#     driver.close()
#     driver.quit()

#     return conv_rate_list



## bnb function

def bnb_conv():

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    conv_rate_list=[]


    driver.get("https://web.bnbcash.app/en")
    # driver.maximize_window()
    time.sleep(5)


    conv_rate_list=[]
    for i in bnb_hardcoded_from_list_dict.keys():
        y_f=True
        while y_f:
            try:
                driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[1]/div[2]/div[1]/span").click()
                time.sleep(1)

                dropdown_id1="/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[1]/div[2]/div[2]/div/div["+ str(i)+ "]/div/span"
                driver.find_element(By.XPATH,dropdown_id1).click()
                time.sleep(1)

                length_list=len(bnb_hardcoded_to_list_dict[bnb_hardcoded_from_list_dict[i]])
            

                for j in range(length_list):
                    y_f=True
                    while y_f:
                        try:
        
                            driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[2]/div[2]/div[1]/span").click()
                            time.sleep(1)
                            country_num=bnb_hardcoded_to_list_dict[bnb_hardcoded_from_list_dict[i]][j]
                            dropdown_id2="/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/div[2]/div[2]/div[2]/div/div["+ str(country_num)+ "]/div/span"
                            driver.find_element(By.XPATH,dropdown_id2).click()
                            time.sleep(1)
                            print(driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text)

                            tilts = driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text
                            frm, rtto, ratesrt = parse_exchange_rate(tilts)
                            save_exchange_rate(frm, rtto, ratesrt, "bnb")
                            conv_rate_list.append(driver.find_element(By.XPATH,"/html/body/div[2]/div/div/section[1]/div/section/aside[2]/div/div/div/p").text)
                            y_f=False
                        except:
                            pass

                y_f=False
                
            except:
                pass


    #close the driver
    driver.close()
    driver.quit()

    return conv_rate_list




def parse_exchange_rate(exchange_rate_str):
    """
    Parse the exchange rate string and extract from currency, to currency, and the rate.

    Args:
        exchange_rate_str (str): The exchange rate string to parse.

    Returns:
        tuple: A tuple containing (from_currency, to_currency, rate).
    """
    # Split the string to extract relevant parts
    try:
        # Example input: "Exchange Rate: 1 CAD = 0.6620 EUR"
        parts = exchange_rate_str.split()
        
        # Extracting from_currency, to_currency, and rate
        from_currency = parts[3]  # CAD
        to_currency = parts[6]    # EUR
        rate = float(parts[5])     # 0.6620
        
        return from_currency, to_currency, rate
    except (IndexError, ValueError) as e:
        print(f"Error parsing exchange rate string: {e}")
        return None

# Example usage
# exchange_rate_str = "Exchange Rate: 1 CAD = 0.6620 EUR"
# from_currency, to_currency, rate = parse_exchange_rate(exchange_rate_str)
# print(f"From Currency: {from_currency}, To Currency: {to_currency}, Rate: {rate}")


## remitly functions
## remitly functions

def remitly_conv():
    counter=1
    remitly_list=[]
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    for i in remitly_from_list:
        for j in remitly_to_list:
            if remitly_to_dict[j]!=i:
                y_f=True
                while y_f:
                    try:
                        
                        url="https://www.remitly.com/"+i+"/en/"+j
                        driver.get(url)
                        
                        if counter==1:
                            driver.maximize_window()
                            driver.find_element(By.XPATH,"//*[@id='c-footerBrandV1']/footer/div[2]/div/div[2]/div[3]/button[2]").click()
                            time.sleep(2)
                            counter+=1
                            rate=driver.find_element(By.XPATH,"//*[@id='send-recv-calc-container']/div[3]/div/div/div[2]").text
                            print(rate)
                            remitly_list.append(rate)
                            y_f=False
                    
                        else:
                            time.sleep(2)
                            rate=driver.find_element(By.XPATH,"//*[@id='send-recv-calc-container']/div[3]/div/div/div[2]").text
                            print(rate)
                            remitly_list.append(rate)
                            y_f=False
                    except:   
                        url="https://www.remitly.com/"+i+"/en/"+j
                        driver.get(url)
                        time.sleep(5)
                        pass
     #close the driver
    driver.close()
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


