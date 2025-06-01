from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains - allow React frontend to call this API

# Load data and model once
data = pd.read_csv('final.csv')

def convert_views_to_number(view_str):
    if isinstance(view_str, str):
        view_str = view_str.strip()
        try:
            if view_str[-1] == 'B':
                return float(view_str[:-1]) * 1e9
            elif view_str[-1] == 'M':
                return float(view_str[:-1]) * 1e6
            elif view_str[-1] == 'K':
                return float(view_str[:-1]) * 1e3
            else:
                return float(view_str.replace(',', ''))
        except Exception:
            return np.nan
    else:
        return view_str

data['video_views'] = data['video_views'].apply(convert_views_to_number)

model = joblib.load('creator_recommendation_model.joblib')

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        content = request.json
        brand_budget_usd = content.get('brand_budget_usd')
        country = content.get('country')
        product_category = content.get('product_category')
        min_views_required = content.get('min_views_required')

        # Validate inputs
        if None in [brand_budget_usd, country, product_category, min_views_required]:
            return jsonify({"error": "Missing input parameters"}), 400

        filtered = data[
            (data['country'].str.lower() == country.lower()) &
            (data['channel_type'].str.lower() == product_category.lower())
        ].copy()

        if filtered.empty:
            return jsonify({"top_creators": [], "message": "No creators found for this country and product category"}), 200

        filtered['brand_budget_usd'] = brand_budget_usd
        filtered['min_views_required'] = min_views_required

        features = [
            'subscribers', 'video_views', 'video_views_for_the_last_30_days',
            'country', 'product_category', 'brand_budget_usd', 'min_views_required'
        ]

        X_candidates = filtered[features]

        # Predict expected earnings
        predicted_earnings = model.predict(X_candidates)
        filtered['predicted_earning'] = predicted_earnings

        top_5 = filtered.sort_values(by='predicted_earning', ascending=False).head(5)

        # Select and format output fields
        result = top_5[[
            'youtuber', 'predicted_earning', 'subscribers',
            'video_views', 'country', 'channel_type'
        ]].copy()

        # Convert to list of dicts
        top_creators = result.to_dict(orient='records')

        return jsonify({"top_creators": top_creators}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

