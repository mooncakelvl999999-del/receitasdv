import re

css_path = r'C:\Users\Camila\Documents\receitasdv\style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace .ingredients grid
css = re.sub(r'\.ingredients\s*\{\s*display:\s*grid;\s*grid-template-columns:[^}]+}', 
             '.ingredients {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));\n    gap: 15px;\n}', 
             css)

# Add square styling to .ingredient-box
square_styles = '''
.ingredient-box {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 15px 10px;
    cursor: pointer;
    text-align: center;
    aspect-ratio: 1; /* Makes it a square */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: transform 0.1s, border-color 0.2s;
}
.ingredient-box:hover {
    border-color: #f59e0b;
    transform: scale(1.02);
}
.ingredient-box label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    font-size: 14px;
    word-break: break-word;
}
.ingredient-box input {
    width: 80%;
    text-align: center;
}
'''
css = re.sub(r'\.ingredient-box\s*\{[^}]+\}', '', css)
css += '\n' + square_styles

# Remove old media queries for ingredients that override columns
css = re.sub(r'@media\s*\([^)]+\)\s*\{\s*\.ingredients\s*\{[^}]+\}\s*\}', '', css)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
