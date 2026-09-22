import os

css_path = r'C:\Users\Camila\Documents\receitasdv\style.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''

/* NEW STYLES */
body {
    font-family: 'Inter', Arial, sans-serif;
}

.ingredient-box {
    cursor: pointer;
    text-align: center;
}
.ingredient-box input {
    display: none;
}
.ingredient-box.active input {
    display: block;
    margin-top: 10px;
}
.ingredient-box.active {
    border-color: #f59e0b;
}

.map-chef-group {
    margin-bottom: 20px;
}
.map-chef-group h3 {
    margin-bottom: 10px;
    font-size: 16px;
    color: #9ca3af;
}

.ingredients-section {
    margin-bottom: 40px;
}
.ingredients-section h2 {
    margin-bottom: 20px;
    border-bottom: 1px solid #374151;
    padding-bottom: 10px;
}
.cost-summary {
    margin-top: 20px;
    padding: 15px;
    background: #1f2937;
    border-radius: 8px;
    border: 1px solid #f59e0b;
    color: #f59e0b;
}
.map-chef-item.disabled {
    opacity: 0.5;
    pointer-events: none;
}
''')
