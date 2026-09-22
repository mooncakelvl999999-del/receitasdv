import os

css_path = r'C:\Users\Camila\Documents\receitasdv\style.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''

/* CHEF ICONS STYLES */
.chefs-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
}
.chef-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.2s, transform 0.1s;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.chef-card:hover {
    border-color: #4b5563;
    transform: scale(1.02);
}
.chef-card.active {
    border-color: #f59e0b;
}
.chef-header {
    font-size: 16px;
    font-weight: bold;
}
.chef-items {
    display: none;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 15px;
}
.chef-card.active .chef-items {
    display: grid;
}
/* Reduce padding for map chef items so they fit inside */
.chef-card .ingredient-box {
    aspect-ratio: auto;
    padding: 10px;
}
''')
