import re
import os

html_path = r'C:\Users\Camila\Documents\receitasdv\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_html = '''
            <section class="ingredients-section">
                <h2>🧑‍🍳 Itens do Cozinheiro do Mapa</h2>
                <div class="map-chef-group">
                    <h3>Chef Cedric</h3>
                    <div class="ingredients" data-chef="cedric">
                        <div class="ingredient-box map-chef-item" data-cost-type="Alface" data-cost-amount="20">
                            <label for="Morango">🍓 Morango</label>
                            <input id="Morango" type="number" min="0" value="0">
                        </div>
                        <div class="ingredient-box map-chef-item" data-cost-type="Leite" data-cost-amount="50">
                            <label for="Cana-de-açúcar">🎋 Cana-de-açúcar</label>
                            <input id="Cana-de-açúcar" type="number" min="0" value="0">
                        </div>
                    </div>
                </div>
                
                <div class="map-chef-group">
                    <h3>Chef Rosa</h3>
                    <div class="ingredients" data-chef="rosa">
                        <div class="ingredient-box map-chef-item" data-cost-type="Leite" data-cost-amount="50">
                            <label for="Milho">🌽 Milho</label>
                            <input id="Milho" type="number" min="0" value="0">
                        </div>
                        <div class="ingredient-box map-chef-item" data-cost-type="Alface" data-cost-amount="20">
                            <label for="Amendoim">🥜 Amendoim</label>
                            <input id="Amendoim" type="number" min="0" value="0">
                        </div>
                    </div>
                </div>

                <div class="map-chef-group">
                    <h3>Chef Gene</h3>
                    <div class="ingredients" data-chef="gene">
                        <div class="ingredient-box map-chef-item" data-cost-type="Trigo" data-cost-amount="100">
                            <label for="Camarão">🦐 Camarão</label>
                            <input id="Camarão" type="number" min="0" value="0">
                        </div>
                        <div class="ingredient-box map-chef-item" data-cost-type="Carne" data-cost-amount="10">
                            <label for="Arroz">🍚 Arroz</label>
                            <input id="Arroz" type="number" min="0" value="0">
                        </div>
                    </div>
                </div>

                <div class="map-chef-group">
                    <h3>Chef Arwen</h3>
                    <div class="ingredients" data-chef="arwen">
                        <div class="ingredient-box map-chef-item" data-cost-type="Alface" data-cost-amount="20">
                            <label for="Batata">🥔 Batata</label>
                            <input id="Batata" type="number" min="0" value="0">
                        </div>
                        <div class="ingredient-box map-chef-item" data-cost-type="Leite" data-cost-amount="50">
                            <label for="Tomate">🍅 Tomate</label>
                            <input id="Tomate" type="number" min="0" value="0">
                        </div>
                    </div>
                </div>
                
                <div id="cost-summary" class="cost-summary" style="display: none;">
                    <strong>Custos para o Cozinheiro:</strong>
                    <span id="cost-text"></span>
                </div>
            </section>

            <section class="ingredients-section">
                <h2>🛒 Ingredientes Regulares</h2>
                <div class="ingredients">
                    <div class="ingredient-box">
                        <label for="Ovo">🥚 Ovo</label>
                        <input id="Ovo" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Trigo">🌾 Trigo</label>
                        <input id="Trigo" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Alface">🥬 Alface</label>
                        <input id="Alface" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Carne">🥩 Carne</label>
                        <input id="Carne" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Leite">🥛 Leite</label>
                        <input id="Leite" type="number" min="0" value="0">
                    </div>
                </div>
            </section>

            <section class="ingredients-section">
                <h2>✨ Itens Especiais</h2>
                <div class="ingredients">
                    <div class="ingredient-box">
                        <label for="Manjericão">🌿 Manjericão</label>
                        <input id="Manjericão" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Cacau">🍫 Cacau</label>
                        <input id="Cacau" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Caviar">🥄 Caviar</label>
                        <input id="Caviar" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Queijo">🧀 Queijo</label>
                        <input id="Queijo" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Pimenta">🌶️ Pimenta</label>
                        <input id="Pimenta" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Favo de mel">🍯 Favo de mel</label>
                        <input id="Favo de mel" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Trufa">🍄 Trufa</label>
                        <input id="Trufa" type="number" min="0" value="0">
                    </div>
                    <div class="ingredient-box">
                        <label for="Atum">🐟 Atum</label>
                        <input id="Atum" type="number" min="0" value="0">
                    </div>
                </div>
            </section>
'''

html = re.sub(r'<section class="ingredients">.*?</section>', new_html, html, flags=re.DOTALL)
html = html.replace('<link rel="stylesheet" href="style.css">', '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">\n    <link rel="stylesheet" href="style.css">')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
