js_path = r'C:\Users\Camila\Documents\receitasdv\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Find and replace only the UI+MAP CHEF block at the bottom
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

    // Normal ingredient click — keep input visible once opened
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

        if (activeCount >= 2) {
            mapChefItems.forEach(item => {
                const input = item.querySelector('input');
                const val = Number(input.value) || 0;
                if (val === 0) item.classList.add('disabled');
            });
        } else {
            mapChefItems.forEach(item => item.classList.remove('disabled'));
        }

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

        const costStrings = Object.entries(costs).map(([type, amount]) => amount + " " + type);
        if (costStrings.length > 0) {
            costSummary.style.display = 'block';
            costText.innerText = costStrings.join(" e ");
        } else {
            costSummary.style.display = 'none';
            costText.innerText = "";
        }

        if (typeof atualizarResultados === 'function') atualizarResultados();
    }

    mapChefItems.forEach(item => {
        const input = item.querySelector('input');
        if (input) {
            input.addEventListener('input', () => {
                let val = Number(input.value) || 0;
                if (val % 10 !== 0) {
                    val = Math.round(val / 10) * 10;
                    input.value = val;
                }
                item.style.borderColor = val > 0 ? '#f59e0b' : '';
                item.classList.add('active');
                updateMapChefState();
            });
        }
        item.addEventListener('click', (e) => {
            if (item.classList.contains('disabled')) return;
            if (e.target.tagName !== 'INPUT') {
                item.classList.add('active');
                if (input) input.focus();
            }
        });
    });

    // Day of the week buttons — now on the LEFT side
    const dayBtns = document.querySelectorAll('.day-btn');
    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.getAttribute('data-day');
            if (selectedDay === day) {
                selectedDay = null;
                dayBtns.forEach(b => b.classList.remove('active'));
            } else {
                selectedDay = day;
                dayBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            if (typeof atualizarResultados === 'function') atualizarResultados();
        });
    });
});

// Override atualizarResultados
function atualizarResultados() {
    const inventario = obterInventario();
    const receitasPossiveis = receitas
        .map(receita => ({ receita, porcoes: calcularPorcoes(receita, inventario) }))
        .filter(item => item.porcoes > 0);

    const highlightType = selectedDay ? DAY_TYPE_MAP[selectedDay] : null;

    // Sort: highlighted first, then rest
    if (highlightType) {
        receitasPossiveis.sort((a, b) => {
            return (b.receita.tipo === highlightType) - (a.receita.tipo === highlightType);
        });
    }

    // Remove old cards without touching the h2
    resultados.querySelectorAll('.recipe, .empty-message').forEach(el => el.remove());

    if (receitasPossiveis.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'empty-message';
        msg.textContent = 'Informe seus ingredientes para descobrir quais pratos voce consegue preparar.';
        resultados.appendChild(msg);
        return;
    }

    receitasPossiveis.forEach(({ receita, porcoes }) => {
        const card = document.createElement('article');
        const isHighlight = highlightType && receita.tipo === highlightType;
        const isDimmed = highlightType && !isHighlight;
        card.className = 'recipe' + (isHighlight ? ' highlight' : '') + (isDimmed ? ' dimmed' : '');

        card.innerHTML = 
            <h3></h3>
            <div class="recipe-info"> &bull; </div>
            <div class="recipe-portions">&#127869;&#65039; Pode fazer: x</div>
            <div class="recipe-ingredients"></div>
        ;
        resultados.appendChild(card);
    });
}

// Override obterInventario
obterInventario = function() {
    const inventario = {};
    const mapChefCosts = {};
    const mapChefGains = {};

    document.querySelectorAll('.map-chef-item').forEach(item => {
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
