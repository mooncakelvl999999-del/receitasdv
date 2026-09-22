import os

css_path = r'C:\Users\Camila\Documents\receitasdv\style.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''

/* DAY SELECTOR & HIGHLIGHTS */
.day-selector {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}
.day-btn {
    background: #374151;
    color: #d1d5db;
    border: 1px solid #4b5563;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-family: inherit;
    transition: all 0.2s;
}
.day-btn:hover {
    background: #4b5563;
}
.day-btn.active {
    background: #f59e0b;
    color: #111827;
    border-color: #f59e0b;
}

.recipe.highlight {
    border-color: #f59e0b;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
    position: relative;
}
.recipe.highlight::before {
    content: "✨ Destaque do Dia";
    display: inline-block;
    background: #f59e0b;
    color: #111827;
    font-size: 11px;
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 10px;
    margin-bottom: 8px;
}
''')
