## AI Service Setup

1. (Optional) create virtual environment.
2. Install requirements: `pip install -r requirements.txt`
3. Ensure `model/symptom_model.pkl` and `model/symptom_binarizer.pkl` exist (run `python train_model.py` to regenerate).
4. Start the Flask service: `python app.py` (listens on port `5001`).

