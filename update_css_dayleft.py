css_path = r'C:\Users\Camila\Documents\receitasdv\style.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''

/* DAY SELECTOR — LEFT SIDE */
.day-selector {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}
.day-btn {
    flex: 1;
    min-width: 130px;
    background: #1f2937;
    color: #d1d5db;
    border: 1px solid #374151;
    padding: 12px 10px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-family: inherit;
    font-size: 14px;
    transition: all 0.2s;
    text-align: center;
}
.day-btn:hover {
    border-color: #f59e0b;
    color: #f9fafb;
}
.day-btn.active {
    background: #f59e0b;
    color: #111827;
    border-color: #f59e0b;
}

/* RECIPE HIGHLIGHT */
.recipe.highlight {
    border-color: #f59e0b;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
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

/* DIMMED recipes when day is selected but recipe doesn\'t match */
.recipe.dimmed {
    opacity: 0.4;
}
''')
