import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
import os # Import the os module

# Example Symptom-Disease Dataset
data = {
    'symptoms': [
        ['fever', 'cough'],
        ['headache', 'fever'],
        ['stomachache', 'vomiting'],
        ['fever', 'fatigue'],
    ],
    'disease': [
        'common cold', 'migraine', 'food poisoning', 'influenza',
    ]
}

df = pd.DataFrame(data)

# Preprocessing: Convert symptoms into a format the model can understand
mlb = MultiLabelBinarizer()
X = pd.DataFrame(mlb.fit_transform(df['symptoms']), columns=mlb.classes_)
y = df['disease']

# Train the model
model = DecisionTreeClassifier()
model.fit(X, y)

# Create the 'model' directory if it doesn't exist
model_dir = 'model'
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

# Save the trained model and the binarizer
joblib.dump(model, os.path.join(model_dir, 'symptom_model.pkl'))
joblib.dump(mlb, os.path.join(model_dir, 'symptom_binarizer.pkl'))

print("Model trained and saved successfully!")