from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# Tell Selenium where ChromeDriver is
service = Service("C:\sanath\chromedriver-win64\chromedriver.exe")

# Open Chrome browser
driver = webdriver.Chrome(service=service)

# Open your website
driver.get("http://localhost:8080/")

# Close browser
driver.quit()
