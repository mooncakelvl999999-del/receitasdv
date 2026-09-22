import re

html_path = r'C:\Users\Camila\Documents\receitasdv\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_html = '''
            <section class="ingredients-section">
                <h2>🧑‍🍳 Itens do Cozinheiro do Mapa</h2>
                
                <div class="chefs-container">
                    <div class="chef-card" data-chef="cedric">
                        <div class="chef-header">👨‍🍳 Chef Cedric</div>
                        <div class="chef-items">
                            <div class="ingredient-box map-chef-item" data-id="Morango" data-cost-type="Alface" data-cost-amount="20">
                                <label>🍓 Morango</label>
                            </div>
                            <div class="ingredient-box map-chef-item" data-id="Cana-de-açúcar" data-cost-type="Leite" data-cost-amount="50">
                                <label>🎋 Cana-de-açúcar</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chef-card" data-chef="rosa">
                        <div class="chef-header">👩‍🍳 Chef Rosa</div>
                        <div class="chef-items">
                            <div class="ingredient-box map-chef-item" data-id="Milho" data-cost-type="Leite" data-cost-amount="50">
                                <label>🌽 Milho</label>
                            </div>
                            <div class="ingredient-box map-chef-item" data-id="Amendoim" data-cost-type="Alface" data-cost-amount="20">
                                <label>🥜 Amendoim</label>
                            </div>
                        </div>
                    </div>

                    <div class="chef-card" data-chef="gene">
                        <div class="chef-header">👨‍🍳 Chef Gene</div>
                        <div class="chef-items">
                            <div class="ingredient-box map-chef-item" data-id="Camarão" data-cost-type="Trigo" data-cost-amount="100">
                                <label>🦐 Camarão</label>
                            </div>
                            <div class="ingredient-box map-chef-item" data-id="Arroz" data-cost-type="Carne" data-cost-amount="10">
                                <label>🍚 Arroz</label>
                            </div>
                        </div>
                    </div>

                    <div class="chef-card" data-chef="arwen">
                        <div class="chef-header">👩‍🍳 Chef Arwen</div>
                        <div class="chef-items">
                            <div class="ingredient-box map-chef-item" data-id="Batata" data-cost-type="Alface" data-cost-amount="20">
                                <label>🥔 Batata</label>
                            </div>
                            <div class="ingredient-box map-chef-item" data-id="Tomate" data-cost-type="Leite" data-cost-amount="50">
                                <label>🍅 Tomate</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="cost-summary" class="cost-summary" style="display: none;">
                    <strong>Custos para o Cozinheiro:</strong>
                    <span id="cost-text"></span>
                </div>
            </section>
'''

html = re.sub(r'<section class="ingredients-section">\s*<h2>🧑‍🍳 Itens do Cozinheiro do Mapa</h2>.*?</section>', new_html, html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
