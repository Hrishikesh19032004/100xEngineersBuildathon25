from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time, re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

def parse_number(text):
    text = text.replace(",", "").lower()
    multiplier = 1
    if 'k' in text:
        multiplier = 1_000
    elif 'm' in text:
        multiplier = 1_000_000
    elif 'b' in text:
        multiplier = 1_000_000_000
    return int(float(re.findall(r"[\d\.]+", text)[0]) * multiplier)

def is_old_upload(date_text):
    if "year" in date_text or "years" in date_text:
        return True
    if "month" in date_text:
        return int(re.findall(r"\d+", date_text)[0]) > 6
    if "week" in date_text:
        return int(re.findall(r"\d+", date_text)[0]) > 25
    return False

@app.route("/analyze", methods=["POST"])
def analyze_channel():
    data = request.get_json()
    channel_name = data.get("channel")

    home_url = f"https://www.youtube.com/@{channel_name}"
    videos_url = f"{home_url}/videos"

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--log-level=3")
    options.add_argument("--window-size=1920,1080")
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        # Step 1: Subscriber and video count
        driver.get(home_url)
        time.sleep(3)
        spans = driver.find_elements(By.XPATH, '//span[@class="yt-core-attributed-string yt-content-metadata-view-model-wiz__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color"]')

        subscriber_count = video_count = "Not Found"
        for span in spans:
            text = span.text.lower()
            if "subscribers" in text:
                subscriber_count = span.text
            elif "videos" in text:
                video_count = span.text

        # Step 2: Latest video details
        driver.get(videos_url)
        time.sleep(5)
        metadata_items = driver.find_elements(By.XPATH, '//span[@class="inline-metadata-item style-scope ytd-video-meta-block"]')

        latest_views = metadata_items[0].text if len(metadata_items) > 0 else "Not found"
        latest_upload = metadata_items[1].text if len(metadata_items) > 1 else "Not found"

        # Step 3: Fraud Detection
        fraud_reasons = []
        sub_count = parse_number(subscriber_count) if subscriber_count != "Not Found" else 0
        vid_count = parse_number(video_count) if video_count != "Not Found" else 0
        view_count = parse_number(latest_views) if latest_views != "Not found" else 0

        if sub_count < 1000:
            fraud_reasons.append("Subscribers < 1K")
        if sub_count > 10_000 and vid_count < 5:
            fraud_reasons.append("Too few videos for many subscribers")
        if latest_upload != "Not found" and is_old_upload(latest_upload.lower()):
            fraud_reasons.append("Latest upload is too old")
        if sub_count > 0 and view_count / sub_count < 0.01:
            fraud_reasons.append("Low views-to-subscribers ratio")
        if sub_count > 0 and vid_count > 0 and (sub_count / vid_count) > 1_000_000:
            fraud_reasons.append("Suspicious subscribers-to-videos ratio")

        status = "Real Channel" if not fraud_reasons else f"Potentially Fraudulent: {', '.join(fraud_reasons)}"

        driver.quit()

        return jsonify({
            "channel": channel_name,
            "subscribers": subscriber_count,
            "videos": video_count,
            "latestViews": latest_views,
            "latestUpload": latest_upload,
            "status": status
        })

    except Exception as e:
        driver.quit()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5002)

