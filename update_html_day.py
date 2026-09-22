import re

html_path = r'C:\Users\Camila\Documents\receitasdv\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_header = '''
        <aside id="results" class="results-panel">
            <h2>🍽️ Pratos possíveis</h2>
            
            <div class="day-selector">
                <button class="day-btn" data-day="Terca">Terça (Entradas)</button>
                <button class="day-btn" data-day="Quarta">Quarta (Pratos Principais)</button>
                <button class="day-btn" data-day="Quinta">Quinta (Sobremesas)</button>
            </div>
'''

html = html.replace('<aside id="results" class="results-panel">\n\n            <h2>🍽️ Pratos possíveis</h2>', new_header)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
