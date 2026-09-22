import re

html_path = r'C:\Users\Camila\Documents\receitasdv\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add inputs back to map-chef-items
def add_input(match):
    content = match.group(0)
    label_match = re.search(r'<label>.*?</label>', content)
    if label_match:
        # Extract the ID from the data-id attribute
        id_match = re.search(r'data-id="([^"]+)"', content)
        item_id = id_match.group(1) if id_match else ''
        input_html = f'\n                            <input id="chef-{item_id}" type="number" min="0" step="10" value="0">'
        return content.replace(label_match.group(0), label_match.group(0) + input_html)
    return content

html = re.sub(r'<div class="ingredient-box map-chef-item"[^>]*>.*?</div>', add_input, html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
