import re

js_path = r'C:\Users\Camila\Documents\receitasdv\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace mangled chars
js = js.replace('-', '•')
js = js.replace('Y??', '🍽️')
js = js.replace('vocǦ', 'você')
js = js.replace('possveis', 'possíveis')
js = js.replace('CABEALHO', 'CABEÇALHO')
js = js.replace('NENHUMA RECEITA DISPON?VEL', 'NENHUMA RECEITA DISPONÍVEL')

# Find the start of our appended block
start_index = js.find('// ============================================================\n// UI AND MAP CHEF LOGIC')
if start_index != -1:
    js = js[:start_index]

new_logic = '''
// ============================================================
// UI AND MAP CHEF LOGIC
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // Normal ingredient click
    const ingredientBoxes = document.querySelectorAll('.ingredients-section > .ingredients .ingredient-box');
    ingredientBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                box.classList.add('active');
                const input = box.querySelector('input');
                if (input) input.focus();
            }
        });
    });
    
    // Chef Card toggle
    const chefCards = document.querySelectorAll('.chef-card');
    chefCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent toggling if clicking an item inside
            if (e.target.closest('.map-chef-item')) return;
            card.classList.toggle('active');
        });
    });
    
    // Map Chef Items selection
    const mapChefItems = document.querySelectorAll('.map-chef-item');
    const costSummary = document.getElementById('cost-summary');
    const costText = document.getElementById('cost-text');
    
    function updateMapChefState() {
        let activeCount = 0;
        const activeItems = [];
        
        mapChefItems.forEach(item => {
            if (item.classList.contains('selected')) {
                activeCount++;
                activeItems.push(item);
            }
        });
        
        if (activeCount >= 2) {
            mapChefItems.forEach(item => {
                if (!item.classList.contains('selected')) {
                    item.classList.add('disabled');
                }
            });
        } else {
            mapChefItems.forEach(item => {
                item.classList.remove('disabled');
            });
        }
        
        const costs = {};
        activeItems.forEach(item => {
            const costType = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            costs[costType] = (costs[costType] || 0) + costAmount;
        });
        
        const costStrings = [];
        for (const [type, amount] of Object.entries(costs)) {
            costStrings.push(amount + " " + type);
        }
        
        if (costStrings.length > 0) {
            costSummary.style.display = 'block';
            costText.innerText = costStrings.join(" e ");
        } else {
            costSummary.style.display = 'none';
            costText.innerText = "";
        }
        
        // Trigger results update
        if (typeof atualizarResultados === 'function') {
            atualizarResultados();
        }
    }
    
    mapChefItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('disabled')) return;
            
            // Toggle selection
            item.classList.toggle('selected');
            
            // Give visual feedback
            if (item.classList.contains('selected')) {
                item.style.borderColor = '#f59e0b';
                item.style.background = '#374151';
            } else {
                item.style.borderColor = '';
                item.style.background = '';
            }
            
            updateMapChefState();
        });
    });
});

// Sobrescrever obterInventario para deduzir o custo e adicionar itens do map chef
const obterInventarioOriginal = obterInventario;
obterInventario = function() {
    const inventario = {};
    const mapChefCosts = {};
    const mapChefGains = {};
    
    // Calcular custos e ganhos do Map Chef
    const mapChefItems = document.querySelectorAll('.map-chef-item');
    mapChefItems.forEach(item => {
        if (item.classList.contains('selected')) {
            const costType = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            mapChefCosts[costType] = (mapChefCosts[costType] || 0) + costAmount;
            
            const gainId = item.getAttribute('data-id');
            mapChefGains[gainId] = (mapChefGains[gainId] || 0) + 10; // Chef gives fixed 10 quantity
        }
    });

    Object.keys(unidadesIngredientes).forEach(ingrediente => {
        const campo = document.getElementById(ingrediente);
        let quantidadeBruta = 0;
        
        if (campo) {
            quantidadeBruta = Number(campo.value) || 0;
        }
        
        // Add Map Chef gains (even if no input field exists)
        if (mapChefGains[ingrediente]) {
            quantidadeBruta += mapChefGains[ingrediente];
        }
        
        // Subtrair o custo se for um ingrediente regular usado
        if (mapChefCosts[ingrediente]) {
            quantidadeBruta -= mapChefCosts[ingrediente];
        }
        
        const unidadesPorPorcao = Number(unidadesIngredientes[ingrediente]);
        
        if (quantidadeBruta <= 0 || unidadesPorPorcao <= 0) {
            inventario[ingrediente] = 0;
            return;
        }
        inventario[ingrediente] = Math.floor(quantidadeBruta / unidadesPorPorcao);
    });
    return inventario;
};
'''

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js + new_logic)
