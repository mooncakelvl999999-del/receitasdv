import os

js_path = r'C:\Users\Camila\Documents\receitasdv\script.js'
with open(js_path, 'a', encoding='utf-8') as f:
    f.write('''

// ============================================================
// UI AND MAP CHEF LOGIC
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    const ingredientBoxes = document.querySelectorAll('.ingredient-box');
    ingredientBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && !box.classList.contains('disabled')) {
                box.classList.add('active');
                const input = box.querySelector('input');
                if (input) input.focus();
            }
        });
    });
    
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
            const qty = Number(input.value) || 0;
            if (qty > 0) {
                const costType = item.getAttribute('data-cost-type');
                const costAmount = Number(item.getAttribute('data-cost-amount'));
                costs[costType] = (costs[costType] || 0) + (qty * costAmount);
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
    }
    
    mapChefItems.forEach(item => {
        const input = item.querySelector('input');
        if (input) {
            input.addEventListener('input', () => {
                updateMapChefState();
                atualizarResultados();
            });
        }
        item.addEventListener('click', () => {
            if (!item.classList.contains('disabled')) {
                updateMapChefState();
            }
        });
    });
});

// Sobrescrever obterInventario para deduzir o custo
const obterInventarioOriginal = obterInventario;
obterInventario = function() {
    const inventario = {};
    const mapChefCosts = {};
    
    // Calcular custos do Map Chef
    const mapChefItems = document.querySelectorAll('.map-chef-item');
    mapChefItems.forEach(item => {
        const input = item.querySelector('input');
        const qty = Number(input?.value) || 0;
        if (qty > 0) {
            const costType = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            mapChefCosts[costType] = (mapChefCosts[costType] || 0) + (qty * costAmount);
        }
    });

    Object.keys(unidadesIngredientes).forEach(ingrediente => {
        const campo = document.getElementById(ingrediente);
        if (!campo) return;
        
        let quantidadeBruta = Number(campo.value) || 0;
        
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
''')
