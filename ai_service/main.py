from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="KrishiMitra Crop Prediction API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and encoders from the models directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

model = joblib.load(os.path.join(MODEL_DIR, "crop_model.pkl"))
encoders = joblib.load(os.path.join(MODEL_DIR, "feature_encoders.pkl"))
target_encoder = joblib.load(os.path.join(MODEL_DIR, "target_encoder.pkl"))

print("✅ Model and encoders loaded successfully!")


class CropInput(BaseModel):
    Temperature: float
    Humidity: float
    Rainfall: float
    PH: float
    Nitrogen: int
    Phosphorous: int
    Potassium: int
    Carbon: float
    Soil: str


@app.get("/")
def root():
    return {"status": "ok", "service": "KrishiMitra Crop Prediction API"}


@app.post("/predict")
def predict_crop(data: CropInput):
    try:
        # Create dataframe matching training data format
        input_data = pd.DataFrame([{
            "Temperature": data.Temperature,
            "Humidity": data.Humidity,
            "Rainfall": data.Rainfall,
            "PH": data.PH,
            "Nitrogen": data.Nitrogen,
            "Phosphorous": data.Phosphorous,
            "Potassium": data.Potassium,
            "Carbon": data.Carbon,
            "Soil": data.Soil,
        }])

        # Encode categorical columns (Soil)
        for col in input_data.columns:
            if col in encoders:
                input_data[col] = encoders[col].transform(input_data[col])

        # Ensure correct column order
        model_columns = [
            'Temperature', 'Humidity', 'Rainfall', 'PH',
            'Nitrogen', 'Phosphorous', 'Potassium', 'Carbon', 'Soil'
        ]
        input_data = input_data[model_columns]

        # Predict
        prediction = model.predict(input_data)
        result = target_encoder.inverse_transform(prediction)

        print(f"🌾 Prediction: {result[0]}")
        return {"prediction": result[0]}

    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return {"error": str(e)}
