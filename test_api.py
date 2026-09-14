
import urllib.request, json
url_login = "http://localhost:8099/api/auth/login"
req = urllib.request.Request(url_login, method="POST", headers={"Content-Type": "application/json"}, data=json.dumps({"mobile":"9490500730", "password":"patient123", "role":"PATIENT"}).encode("utf-8"))
try:
    resp = urllib.request.urlopen(req)
    token = json.loads(resp.read())["data"]["token"]
    print("Token obtained")
    
    url_dash = "http://localhost:8099/api/patients/me/dashboard"
    req_dash = urllib.request.Request(url_dash, method="GET", headers={"Authorization": "Bearer " + token})
    resp_dash = urllib.request.urlopen(req_dash)
    print("Dashboard fetched successfully", json.loads(resp_dash.read())["message"])
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)

