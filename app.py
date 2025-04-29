from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
import os
import random

app = Flask(__name__)

# Load the trained model and intervention mapping
model_path = 'model/unemployment_model.pkl'
mapping_path = 'model/intervention_mapping.pkl'

# Check if model exists, otherwise display appropriate message
if os.path.exists(model_path) and os.path.exists(mapping_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(mapping_path, 'rb') as f:
        intervention_mapping = pickle.load(f)
    model_loaded = True
else:
    model = None
    intervention_mapping = None
    model_loaded = False

@app.route('/')
def home():
    return render_template('index.html', model_status=model_loaded)

@app.route('/analyze', methods=['POST'])
def analyze():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded. Please train the model first.'})
    
    data = request.get_json()
    description = data.get('description', '')
    
    if not description:
        return jsonify({'error': 'No description provided'})
    
    # Predict unemployment barrier
    barrier = model.predict([description])[0]
    
    # Get prediction probability
    proba = model.predict_proba([description])[0]
    max_proba = max(proba) * 100
    
    # Select a recommended intervention
    interventions = intervention_mapping[barrier]
    recommended_intervention = random.choice(interventions)
    
    return jsonify({
        'barrier': barrier,
        'confidence': round(max_proba, 2),
        'intervention': recommended_intervention,
        'description': description
    })

@app.route('/stats')
def stats():
    try:
        # Load the dataset for statistics
        df = pd.read_csv('kenya_youth_employment.csv')
        
        # Calculate statistics
        barrier_counts = df['unemployment_barrier'].value_counts().to_dict()
        employment_counts = df['employment_status'].value_counts().to_dict()
        education_counts = df['education'].value_counts().to_dict()
        
        # Calculate barrier by employment status
        barrier_by_employment = df.groupby(['employment_status', 'unemployment_barrier']).size().unstack().fillna(0).to_dict()
        
        # Calculate intervention frequency
        intervention_counts = df['recommended_intervention'].value_counts().to_dict()
        
        return jsonify({
            'barrier_counts': barrier_counts,
            'employment_counts': employment_counts,
            'education_counts': education_counts,
            'barrier_by_employment': barrier_by_employment,
            'intervention_counts': intervention_counts
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/interventions')
def interventions():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'})
    
    return jsonify(intervention_mapping)

if __name__ == '__main__':
    app.run(debug=True)