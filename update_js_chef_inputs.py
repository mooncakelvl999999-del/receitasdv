import re

js_path = r'C:\Users\Camila\Documents\receitasdv\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

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
            const input = item.querySelector('input');
            const val = Number(input.value) || 0;
            if (val > 0 || item.classList.contains('active')) {
                activeCount++;
                activeItems.push(item);
            }
        });
        
        if (activeCount >= 2) {
            mapChefItems.forEach(item => {
                const input = item.querySelector('input');
                const val = Number(input.value) || 0;
                if (val === 0 && !item.classList.contains('active')) {
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
            const input = item.querySelector('input');
            const val = Number(input.value) || 0;
            if (val > 0) {
                const costType = item.getAttribute('data-cost-type');
                const costAmount = Number(item.getAttribute('data-cost-amount'));
                const batches = Math.floor(val / 10);
                costs[costType] = (costs[costType] || 0) + (batches * costAmount);
            }
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
        
        if (typeof atualizarResultados === 'function') {
            atualizarResultados();
        }
    }
    
    mapChefItems.forEach(item => {
        const input = item.querySelector('input');
        
        if (input) {
            input.addEventListener('input', () => {
                // Force steps of 10 if necessary (browser UI step="10" handles mostly, but just in case)
                let val = Number(input.value) || 0;
                if (val % 10 !== 0) {
                    val = Math.round(val / 10) * 10;
                    input.value = val;
                }
                
                if (val > 0) {
                    item.style.borderColor = '#f59e0b';
                } else {
                    item.style.borderColor = '';
                    item.classList.remove('active');
                }
                updateMapChefState();
            });
        }

        item.addEventListener('click', (e) => {
            if (item.classList.contains('disabled')) return;
            if (e.target.tagName !== 'INPUT') {
                item.classList.add('active');
                if (input) input.focus();
                updateMapChefState();
            }
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
        const input = item.querySelector('input');
        const val = Number(input?.value) || 0;
        
        if (val > 0) {
            const costType = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            const batches = Math.floor(val / 10);
            
            mapChefCosts[costType] = (mapChefCosts[costType] || 0) + (batches * costAmount);
            
            const gainId = item.getAttribute('data-id');
            mapChefGains[gainId] = (mapChefGains[gainId] || 0) + val;
        }
    });

    Object.keys(unidadesIngredientes).forEach(ingrediente => {
        const campo = document.getElementById(ingrediente);
        let quantidadeBruta = 0;
        
        if (campo) {
            quantidadeBruta = Number(campo.value) || 0;
        }
        
        // Add Map Chef gains (even if no regular input field exists, though usually they don't overlap)
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
