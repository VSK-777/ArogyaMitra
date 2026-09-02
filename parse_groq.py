import urllib.request
import re
from bs4 import BeautifulSoup

url = 'https://console.groq.com/docs/models'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    matches = set(re.findall(r'(llama-3\.[0-9]-[a-z0-9-]+|llama3-[a-z0-9-]+|mixtral-[a-z0-9-]+|gemma[a-z0-9-]+)', html.lower()))
    print("Found potential model names:", list(matches))
except Exception as e:
    print(e)
