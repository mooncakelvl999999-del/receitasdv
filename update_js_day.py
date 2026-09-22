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

let selectedDay = null;

const DAY_TYPE_MAP = {
    'Terca': 'Entrada',
    'Quarta': 'Prato Principal',
    'Quinta': 'Sobremesa'
};

document.addEventListener("DOMContentLoaded", () => {

    // Normal ingredient click — always keep input visible once opened
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
            const isActive = card.classList.contains('active');
            card.classList.toggle('active');
            // If collapsing, reset items inside to 0
            if (isActive) {
                card.querySelectorAll('.map-chef-item input').forEach(input => {
                    input.value = 0;
                });
                card.querySelectorAll('.map-chef-item').forEach(item => {
                    item.style.borderColor = '';
                    item.classList.remove('active');
                });
                updateMapChefState();
            }
        });
    });

    // Map Chef Items
    const mapChefItems = document.querySelectorAll('.map-chef-item');
    const costSummary = document.getElementById('cost-summary');
    const costText = document.getElementById('cost-text');

    function updateMapChefState() {
        let activeCount = 0;
        const activeItems = [];

        mapChefItems.forEach(item => {
            const input = item.querySelector('input');
            const val = Number(input.value) || 0;
            if (val > 0) {
                activeCount++;
                activeItems.push(item);
            }
        });

        // Disable items beyond 2 types selected
        if (activeCount >= 2) {
            mapChefItems.forEach(item => {
                const input = item.querySelector('input');
                const val = Number(input.value) || 0;
                if (val === 0) {
                    item.classList.add('disabled');
                }
            });
        } else {
            mapChefItems.forEach(item => {
                item.classList.remove('disabled');
            });
        }

        // Build costs from batches of 10
        const costs = {};
        activeItems.forEach(item => {
            const input = item.querySelector('input');
            const val = Number(input.value) || 0;
            const batches = Math.floor(val / 10);
            if (batches > 0) {
                const costType = item.getAttribute('data-cost-type');
                const costAmount = Number(item.getAttribute('data-cost-amount'));
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
                let val = Number(input.value) || 0;
                // Snap to multiples of 10
                if (val % 10 !== 0) {
                    val = Math.round(val / 10) * 10;
                    input.value = val;
                }
                item.style.borderColor = val > 0 ? '#f59e0b' : '';
                // FIX: Keep active (input visible) even if reduced to 0
                if (!item.classList.contains('active')) {
                    item.classList.add('active');
                }
                updateMapChefState();
            });
        }

        item.addEventListener('click', (e) => {
            if (item.classList.contains('disabled')) return;
            if (e.target.tagName !== 'INPUT') {
                // FIX: Toggle active, but only collapse if chef card is collapsed
                item.classList.add('active');
                if (input) input.focus();
            }
        });
    });

    // Day of the week buttons
    const dayBtns = document.querySelectorAll('.day-btn');
    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.getAttribute('data-day');
            if (selectedDay === day) {
                // Deselect if clicking the same day
                selectedDay = null;
                dayBtns.forEach(b => b.classList.remove('active'));
            } else {
                selectedDay = day;
                dayBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            if (typeof atualizarResultados === 'function') {
                atualizarResultados();
            }
        });
    });
});

// Override atualizarResultados to inject highlight logic
const _atualizarResultadosOriginal = typeof atualizarResultados === 'function' ? atualizarResultados : null;

function atualizarResultados() {
    const inventario = obterInventario();
    const receitasPossiveis = receitas
        .map(receita => {
            const porcoes = calcularPorcoes(receita, inventario);
            return { receita, porcoes };
        })
        .filter(item => item.porcoes > 0);

    // Sort: highlight day's type first
    const highlightType = selectedDay ? DAY_TYPE_MAP[selectedDay] : null;

    if (highlightType) {
        receitasPossiveis.sort((a, b) => {
            const aMatch = a.receita.tipo === highlightType;
            const bMatch = b.receita.tipo === highlightType;
            return bMatch - aMatch;
        });
    }

    // Keep day buttons alive (do NOT wipe them with innerHTML)
    const daySelector = document.querySelector('.day-selector');
    
    if (receitasPossiveis.length === 0) {
        // Clear all cards but keep day buttons
        const existingCards = resultados.querySelectorAll('.recipe');
        existingCards.forEach(c => c.remove());
        
        let emptyMsg = resultados.querySelector('.empty-message');
        if (!emptyMsg) {
            emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-message';
            resultados.appendChild(emptyMsg);
        }
        emptyMsg.textContent = 'Informe seus ingredientes para descobrir quais pratos você consegue preparar.';
        return;
    }

    // Remove old empty message if present
    const emptyMsg = resultados.querySelector('.empty-message');
    if (emptyMsg) emptyMsg.remove();

    // Remove old recipe cards
    resultados.querySelectorAll('.recipe').forEach(c => c.remove());

    receitasPossiveis.forEach(({ receita, porcoes }) => {
        const card = document.createElement('article');
        const isHighlight = highlightType && receita.tipo === highlightType;
        card.className = 'recipe' + (isHighlight ? ' highlight' : '');

        const ingredientes = formatarIngredientes(receita.ingredientes);

        card.innerHTML = 
            <h3></h3>
            <div class="recipe-info"> • </div>
            <div class="recipe-portions">🍽️ Pode fazer: x</div>
            <div class="recipe-ingredients"></div>
        ;

        resultados.appendChild(card);
    });
}

// Sobrescrever obterInventario para deduzir custo e adicionar ganhos do Map Chef
obterInventario = function() {
    const inventario = {};
    const mapChefCosts = {};
    const mapChefGains = {};

    const mapChefItems = document.querySelectorAll('.map-chef-item');
    mapChefItems.forEach(item => {
        const input = item.querySelector('input');
        const val = Number(input?.value) || 0;
        if (val > 0) {
            const batches = Math.floor(val / 10);
            const costType = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            mapChefCosts[costType] = (mapChefCosts[costType] || 0) + (batches * costAmount);
            const gainId = item.getAttribute('data-id');
            mapChefGains[gainId] = (mapChefGains[gainId] || 0) + val;
        }
    });

    Object.keys(unidadesIngredientes).forEach(ingrediente => {
        const campo = document.getElementById(ingrediente);
        let quantidadeBruta = campo ? (Number(campo.value) || 0) : 0;

        if (mapChefGains[ingrediente]) quantidadeBruta += mapChefGains[ingrediente];
        if (mapChefCosts[ingrediente]) quantidadeBruta -= mapChefCosts[ingrediente];

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
