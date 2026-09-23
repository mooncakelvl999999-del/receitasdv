let receitas = [];
let unidadesIngredientes = {};
let selectedDay = null;

const IMAGENS_INGREDIENTES = {
    Ovo: 'Ovo', Trigo: 'Trigo', Alface: 'Alface', Carne: 'Carne', Leite: 'Leite',
    Manjericão: 'Manjericão', Cacau: 'Cacau', Caviar: 'Caviar', Queijo: 'Queijo',
    Pimenta: 'Pimenta', 'Favo de mel': 'Favo de mel', Trufa: 'Trufa', Atum: 'Atum',
    Milho: 'Milho', Amendoim: 'Amendoim', Batata: 'Batata', Arroz: 'Arroz',
    Camarão: 'Camarão', Morango: 'Morango', 'Cana-de-açúcar': 'Cana-de-açúcar', Tomate: 'Tomate'
};

const CUSTOS_CHEF = {
    Alface: 20,
    Carne: 10,
    Leite: 50,
    Trigo: 100
};

const ICONES_CUSTOS_CHEF = {
    Alface: '🥬',
    Carne: '🥩',
    Leite: '🥛',
    Trigo: '🌾'
};

const DAY_TYPE_MAP = {
    'Terca':  'Entrada',
    'Quarta': 'Prato Principal',
    'Quinta': 'Sobremesa'
};

const resultados = document.getElementById('results');

// ============================================================
// LOAD JSON DATA
// ============================================================

async function carregarDados() {
    try {
        const [receitasRes, ingredientesRes] = await Promise.all([
            fetch('receitas.json'),
            fetch('ingredientes.json')
        ]);

        if (!receitasRes.ok)     throw new Error('Não foi possível carregar receitas.json');
        if (!ingredientesRes.ok) throw new Error('Não foi possível carregar ingredientes.json');

        receitas             = await receitasRes.json();
        unidadesIngredientes = await ingredientesRes.json();

        configurarCampos();
        atualizarResultados();

    } catch (erro) {
        console.error(erro);
        const msg = document.createElement('p');
        msg.className = 'empty-message';
        msg.textContent = 'Erro ao carregar os arquivos de receitas.';
        resultados.appendChild(msg);
    }
}

// ============================================================
// WIRE UP REGULAR / SPECIAL INGREDIENT INPUTS
// ============================================================

function configurarCampos() {
    Object.keys(unidadesIngredientes).forEach(ingrediente => {
        const campo = document.getElementById(ingrediente);
        if (!campo) return;
        campo.addEventListener('input',  () => { updateAffordability(); atualizarResultados(); });
        campo.addEventListener('change', () => { updateAffordability(); atualizarResultados(); });
    });
}

// ============================================================
// GET CURRENT REGULAR INGREDIENT QUANTITIES (raw)
// ============================================================

function getRawRegularQty(ingrediente) {
    const campo = document.getElementById(ingrediente);
    return campo ? (Number(campo.value) || 0) : 0;
}

function getChefCostType(item) {
    return item ? item.dataset.costType || '' : '';
}

function getChefCostAmount(item) {
    return CUSTOS_CHEF[getChefCostType(item)] || 0;
}

function getSelectedSiblingCostTypes(item) {
    const chef = item.closest('.chef-card');
    return [...chef.querySelectorAll('.map-chef-item')]
        .filter(other => other !== item)
        .map(getChefCostType)
        .filter(Boolean);
}

function renderChefCostOptions(item) {
    const options = item.querySelector('.chef-cost-options');
    if (!options) return;

    let selectedLabel = item.querySelector('.chef-cost-selection');
    if (!selectedLabel) {
        selectedLabel = document.createElement('small');
        selectedLabel.className = 'chef-cost-selection';
        options.before(selectedLabel);
    }

    const selectedType = getChefCostType(item);
    item.classList.toggle('cost-selected', Boolean(selectedType));
    const usedBySibling = getSelectedSiblingCostTypes(item);
    options.innerHTML = Object.keys(CUSTOS_CHEF).map(type => {
        const disabled = usedBySibling.includes(type);
        const selected = selectedType === type;
        const image = IMAGENS_INGREDIENTES[type];
        return `<button type="button" class="chef-cost-btn${selected ? ' selected' : ''}" data-cost-type="${type}" aria-label="${type}, ${CUSTOS_CHEF[type]} unidades" aria-pressed="${selected}"${disabled ? ' disabled' : ''} title="${type} (${CUSTOS_CHEF[type]})"><img src="assets/ingredients/${image}.png" alt="${type}"></button>`;
    }).join('');

    selectedLabel.textContent = selectedType
        ? `Cobrado com ${selectedType} (${CUSTOS_CHEF[selectedType]})`
        : 'Escolha o ingrediente usado para comprar';
}

function renderAllChefCostOptions() {
    document.querySelectorAll('.map-chef-item').forEach(renderChefCostOptions);
}

function getSelectedChefCard() {
    return document.querySelector('.chef-card.active');
}

function getActiveChefCards() {
    return [...document.querySelectorAll('.chef-card.active')];
}

function chefDoesNotUseRegularIngredients(card) {
    return Boolean(card && card.querySelector('.chef-checkbox input:checked'));
}

// ============================================================
// AFFORDABILITY CHECK
// Updates each map-chef-item: can the user afford X more of it?
// ============================================================

function updateAffordability() {
    const activeChefs = getActiveChefCards();
    const allChefItems = activeChefs.flatMap(card => [...card.querySelectorAll('.map-chef-item')]);

    // Tally current chef costs already committed
    const committed = {};
    allChefItems.forEach(item => {
        const chef = item.closest('.chef-card');
        const val = Number(item.querySelector('input').value) || 0;
        const costType = getChefCostType(item);
        const costAmount = getChefCostAmount(item);
        if (val > 0 && costType && !chefDoesNotUseRegularIngredients(chef)) {
            const batches = Math.floor(val / 10);
            committed[costType] = (committed[costType] || 0) + (batches * costAmount);
        }
    });

    allChefItems.forEach(item => {
        const chef        = item.closest('.chef-card');
        const input      = item.querySelector('input');
        const val        = Number(input.value) || 0;
        const costType   = getChefCostType(item);
        const costAmount = getChefCostAmount(item);

        let warning = item.querySelector('.ingredient-warning');
        if (!warning) {
            warning = document.createElement('small');
            warning.className = 'ingredient-warning';
            item.appendChild(warning);
        }

        if (!costType) {
            item.classList.remove('cannot-afford');
            input.disabled = true;
            input.title = 'Escolha como pagar este ingrediente';
            warning.hidden = true;
            return;
        }

        if (chefDoesNotUseRegularIngredients(chef)) {
            item.classList.remove('cannot-afford');
            input.disabled = false;
            input.title = '';
            const existingWarning = item.querySelector('.ingredient-warning');
            if (existingWarning) {
                existingWarning.hidden = true;
                existingWarning.textContent = '';
            }
            return;
        }

        // How many of this regular ingredient do we have, minus what's already spent on OTHER chef items
        const alreadySpentOnThis = val > 0 ? (Math.floor(val / 10) * costAmount) : 0;
        const spentElsewhere     = (committed[costType] || 0) - alreadySpentOnThis;
        const rawAvailable       = chefDoesNotUseRegularIngredients(chef) ? Infinity : getRawRegularQty(costType);
        const remaining          = rawAvailable - spentElsewhere;

        // Can the user afford at least ONE batch (10 items)?
        const canAfford = remaining >= costAmount;
        if (!canAfford && val === 0) {
            item.classList.add('cannot-afford');
            input.disabled = true;
            input.title    = `Você precisa de ${costAmount} ${costType} (tem ${remaining})`;
            warning.textContent = `Ingredientes insuficientes: precisa de ${costAmount} ${costType} (tem ${remaining}).`;
            warning.hidden = false;
        } else {
            item.classList.remove('cannot-afford');
            input.disabled = false;
            input.title    = '';
            warning.hidden = true;
        }
    });
}

// ============================================================
// INVENTORY — reads regular inputs + map chef gains/costs
// ============================================================

function obterInventario() {
    const inventario   = {};
    const mapChefCosts = {};
    const mapChefGains = {};
    const activeChefs  = getActiveChefCards();

    activeChefs.forEach(chef => chef.querySelectorAll('.map-chef-item').forEach(item => {
        const input = item.querySelector('input');
        const val   = Number(input ? input.value : 0) || 0;
        if (val > 0) {
            const batches    = Math.floor(val / 10);
            const costType   = getChefCostType(item);
            const costAmount = getChefCostAmount(item);
            const gainId     = item.getAttribute('data-id');
            if (costType && !chefDoesNotUseRegularIngredients(chef)) {
                mapChefCosts[costType] = (mapChefCosts[costType] || 0) + (batches * costAmount);
            }
            mapChefGains[gainId]   = (mapChefGains[gainId]   || 0) + val;
        }
    }));

    Object.keys(unidadesIngredientes).forEach(ingrediente => {
        const campo = document.getElementById(ingrediente);
        const box   = campo ? campo.closest('.ingredient-box') : null;
        let qty     = campo && box && box.classList.contains('active') ? (Number(campo.value) || 0) : 0;

        if (mapChefGains[ingrediente]) qty += mapChefGains[ingrediente];
        if (mapChefCosts[ingrediente]) qty -= mapChefCosts[ingrediente];

        const unidades = Number(unidadesIngredientes[ingrediente]);
        inventario[ingrediente] = (qty <= 0 || unidades <= 0) ? 0 : Math.floor(qty / unidades);
    });

    return inventario;
}

// ============================================================
// COUNT DUPLICATE INGREDIENTS
// ============================================================

function contarIngredientes(lista) {
    return lista.reduce((acc, i) => { acc[i] = (acc[i] || 0) + 1; return acc; }, {});
}

// ============================================================
// HOW MANY TIMES CAN WE MAKE THIS RECIPE?
// ============================================================

function calcularPorcoes(receita, inventario) {
    const necessario = contarIngredientes(receita.ingredientes);
    let max = Infinity;
    for (const [ing, qty] of Object.entries(necessario)) {
        const disponivel = inventario[ing] || 0;
        const possiveis  = Math.floor(disponivel / qty);
        if (possiveis === 0) return 0;
        max = Math.min(max, possiveis);
    }
    return max === Infinity ? 0 : max;
}

// ============================================================
// FORMAT INGREDIENT LIST FOR DISPLAY
// ============================================================

function formatarIngredientes(lista) {
    return Object.entries(contarIngredientes(lista))
        .map(([ing, qty]) => {
            const imagem = IMAGENS_INGREDIENTES[ing];
            const visual = imagem
                ? '<img src="assets/ingredients/' + imagem + '.png" alt="">'
                : '';
            return '<span class="recipe-ingredient">' + visual + '<span>' + ing + (qty === 1 ? '' : ' \u00d7' + qty) + '</span></span>';
        })
        .join(' ');
}

// ============================================================
// COST SUMMARY BOX
// ============================================================

function updateMapChefCostSummary() {
    const costSummary = document.getElementById('cost-summary');
    const costText    = document.getElementById('cost-text');
    const costs       = {};

    getActiveChefCards().forEach(chef => {
        if (chefDoesNotUseRegularIngredients(chef)) return;
        chef.querySelectorAll('.map-chef-item').forEach(item => {
        const val = Number(item.querySelector('input').value) || 0;
        const costType = getChefCostType(item);
        const costAmount = getChefCostAmount(item);
        if (val > 0 && costType) {
            const batches    = Math.floor(val / 10);
            costs[costType]  = (costs[costType] || 0) + (batches * costAmount);
        }
        });
    });

    const parts = Object.entries(costs).map(([t, a]) => a + ' ' + t);
    costSummary.style.display = parts.length > 0 ? 'block' : 'none';
    costText.textContent      = parts.join(' e ');
}

function obterSugestaoDeTroca(receita, inventario) {
    const activeChefs = getActiveChefCards();
    if (!activeChefs.some(chef => !chefDoesNotUseRegularIngredients(chef))) return null;

    const options = new Map();
    activeChefs.forEach(chef => chef.querySelectorAll('.map-chef-item').forEach(item => {
        const costType = getChefCostType(item);
        if (costType && !options.has(item.dataset.id)) {
            options.set(item.dataset.id, {
                costType,
                costAmount: getChefCostAmount(item),
                chefName: item.closest('.chef-card').querySelector('.chef-header').textContent.trim()
            });
        }
    }));

    const currentCosts = {};
    const chefGains = {};
    activeChefs.forEach(chef => {
        chef.querySelectorAll('.map-chef-item').forEach(item => {
            const quantity = Number(item.querySelector('input').value) || 0;
            if (quantity > 0) {
                chefGains[item.dataset.id] = (chefGains[item.dataset.id] || 0) + quantity;
            }
            const costType = getChefCostType(item);
            if (quantity > 0 && costType && !chefDoesNotUseRegularIngredients(chef)) {
                const batches = Math.floor(quantity / 10);
                currentCosts[costType] = (currentCosts[costType] || 0) + batches * getChefCostAmount(item);
            }
        });
    });

    const trades = [];
    const tradeGains = {};
    const needed = contarIngredientes(receita.ingredientes);
    for (const [ingredient, quantity] of Object.entries(needed)) {
        const missing = quantity - (inventario[ingredient] || 0);
        if (missing <= 0) continue;
        const option = options.get(ingredient);
        if (!option) return null;
        const unitsPerIngredient = Number(unidadesIngredientes[ingredient]) || 1;
        const requiredRaw = missing * unitsPerIngredient;
        const batches = Math.ceil(requiredRaw / 10);
        const cost = batches * option.costAmount;
        currentCosts[option.costType] = (currentCosts[option.costType] || 0) + cost;
        tradeGains[ingredient] = (tradeGains[ingredient] || 0) + batches * 10;
        trades.push({ ingredient, quantity: missing, cost, costType: option.costType, chefName: option.chefName });
    }

    if (!trades.length) return null;
    if (Object.entries(currentCosts).some(([type, cost]) => getRawRegularQty(type) < cost)) return null;

    const projectedInventory = {};
    Object.keys(unidadesIngredientes).forEach(ingredient => {
        const rawInput = getRawRegularQty(ingredient);
        const remainingRaw = rawInput - (currentCosts[ingredient] || 0);
        const totalItems = remainingRaw + (chefGains[ingredient] || 0) + (tradeGains[ingredient] || 0);
        const units = Number(unidadesIngredientes[ingredient]);
        projectedInventory[ingredient] = totalItems > 0 && units > 0 ? Math.floor(totalItems / units) : 0;
    });

    if (Object.entries(needed).some(([ingredient, quantity]) => (projectedInventory[ingredient] || 0) < quantity)) return null;
    return trades;
}

function criarCardDeReceita(receita, porcoes, trades = null) {
    const isSuggestion = Boolean(trades);
    const bonus = receita.tipo_efeito
        ? '<div class="recipe-bonus">🎁 Bônus ao preparar: ' + receita.tipo_efeito + (receita.porcentagem ? ' +' + (Number(receita.porcentagem) * 100).toLocaleString('pt-BR') + '%' : '') + '</div>'
        : '';
    const card = document.createElement('article');
    card.className = 'recipe' + (isSuggestion ? ' recipe-suggestion' : '');
    card.innerHTML = [
        '<img class="recipe-image" src="assets/recipes/recipe-' + receita.id + '.png" alt="' + receita.nome + '">',
        '<h3>' + receita.nome + '</h3>',
        '<div class="recipe-info">' + receita.tipo + ' &bull; ' + receita.raridade + '</div>',
        isSuggestion ? '<div class="trade-suggestion">Troque ' + trades.map(trade => trade.quantity + 'x ' + trade.ingredient + ' com ' + trade.chefName).join(' e ') + '</div>' : '',
        '<div class="recipe-ingredients">' + formatarIngredientes(receita.ingredientes) + '</div>',
        bonus
    ].join('');
    return card;
}

function ordemDeRaridade(raridade) {
    const normalizada = raridade.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalizada.includes('immortal') || normalizada.includes('imortal')) return 1;
    if (normalizada.includes('myth') || normalizada.includes('mitico')) return 2;
    if (normalizada.includes('legend') || normalizada.includes('lendario')) return 3;
    if (normalizada.includes('epic') || normalizada.includes('epico')) return 4;
    if (normalizada.includes('raro')) return 5;
    if (normalizada.includes('excelente') || normalizada.includes('great')) return 6;
    if (normalizada.includes('comum')) return 7;
    return 99;
}

function ordemDeCategoria(tipo, highlightType) {
    if (highlightType && tipo === highlightType) return 0;
    const ordem = ['Entrada', 'Prato Principal', 'Sobremesa'];
    return (ordem.indexOf(tipo) + 1) || 99;
}

// ============================================================
// UPDATE RESULTS PANEL
// ============================================================

function atualizarResultados() {
    const inventario    = obterInventario();
    const highlightType = selectedDay ? DAY_TYPE_MAP[selectedDay] : null;

    const receitasPossiveis = receitas
        .map(r => ({ receita: r, porcoes: calcularPorcoes(r, inventario) }))
        .filter(x => x.porcoes > 0);

    resultados.querySelectorAll('.recipe, .empty-message').forEach(el => el.remove());

    if (!getActiveChefCards().length) {
        const msg = document.createElement('p');
        msg.className = 'empty-message chef-required-message';
        msg.textContent = 'Escolha um chef para ver os pratos possíveis.';
        resultados.appendChild(msg);
        return;
    }

    const sugestoes = receitas
        .filter(receita => !receitasPossiveis.some(item => item.receita.id === receita.id))
        .map(receita => ({ receita, trades: obterSugestaoDeTroca(receita, inventario) }))
        .filter(item => item.trades);

    const listaCompleta = [
        ...receitasPossiveis.map(item => ({ ...item, trades: null })),
        ...sugestoes.map(item => ({ receita: item.receita, porcoes: 0, trades: item.trades }))
    ].sort((a, b) => {
        const categoryOrder = ordemDeCategoria(a.receita.tipo, highlightType) - ordemDeCategoria(b.receita.tipo, highlightType);
        return categoryOrder || ordemDeRaridade(a.receita.raridade) - ordemDeRaridade(b.receita.raridade) || a.receita.id - b.receita.id;
    });

    listaCompleta.forEach(({ receita, porcoes, trades }) => {
        const isHighlight = highlightType && receita.tipo === highlightType;
        const isDimmed = highlightType && !isHighlight;
        const card = criarCardDeReceita(receita, porcoes, trades);
        if (isHighlight) card.classList.add('highlight');
        if (isDimmed) card.classList.add('dimmed');
        resultados.appendChild(card);
    });

    if (!listaCompleta.length) {
        const msg = document.createElement('p');
        msg.className = 'empty-message';
        msg.textContent = 'Nenhum prato disponível com os ingredientes informados.';
        resultados.appendChild(msg);
    }
}

// ============================================================
// DOM INTERACTIONS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Regular / Special ingredient boxes: click to reveal input ---
    document.querySelectorAll('.ingredients-section > .ingredients .ingredient-box').forEach(box => {
        box.addEventListener('click', e => {
            if (e.target.tagName === 'INPUT') return;
            const isActive = box.classList.toggle('active');
            const input = box.querySelector('input');
            if (input && isActive) input.focus();
        });
    });

    // --- Chef cards: one normal chef plus any number of rune chefs ---
    const allChefCards = document.querySelectorAll('.chef-card');

    function populateChefPreview(card) {
        const preview = card.querySelector('.chef-preview');
        preview.innerHTML = [...card.querySelectorAll('.map-chef-item')].map(item => {
            const image = item.querySelector('.ingredient-icon');
            return image ? `<img src="${image.src}" alt="${item.dataset.id}">` : '';
        }).join('');
    }

    function openChef(card) {
        if (card.classList.contains('active')) {
            card.classList.remove('active', 'rune-active');
            card.querySelector('.rune-checkbox input').checked = false;
        } else if (card.querySelector('.rune-checkbox input').checked) {
            card.classList.add('active', 'rune-active');
        } else if (!document.querySelector('.chef-card.active:not(.rune-active)')) {
            card.classList.add('active');
        } else {
            card.classList.add('chef-blocked');
            window.setTimeout(() => card.classList.remove('chef-blocked'), 350);
            return;
        }

        allChefCards.forEach(other => {
            other.querySelector('.chef-header').setAttribute('aria-disabled', 'false');
        });

        updateMapChefCostSummary();
        updateAffordability();
        atualizarResultados();
    }

    allChefCards.forEach(card => {
        populateChefPreview(card);
        card.querySelectorAll('.map-chef-item').forEach(renderChefCostOptions);
        card.querySelector('.chef-header').addEventListener('click', () => openChef(card));
        card.querySelectorAll('.chef-checkbox input').forEach(checkbox => checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                card.querySelectorAll('.chef-checkbox input').forEach(other => {
                    if (other !== checkbox) other.checked = false;
                });
            }
            if (checkbox.closest('.rune-checkbox')) {
                if (checkbox.checked) {
                    card.classList.add('active', 'rune-active');
                } else if (card.classList.contains('rune-active')) {
                    card.classList.remove('active', 'rune-active');
                }
            } else if (checkbox.checked && !card.classList.contains('active')) {
                if (!document.querySelector('.chef-card.active:not(.rune-active)')) card.classList.add('active');
                else checkbox.checked = false;
            }
            updateMapChefCostSummary();
            updateAffordability();
            atualizarResultados();
        }));
    });

    // --- Chef cost ingredient choices ---
    document.querySelectorAll('.chef-cost-options').forEach(options => {
        options.addEventListener('click', event => {
            const button = event.target.closest('.chef-cost-btn');
            if (!button || button.disabled) return;

            const item = options.closest('.map-chef-item');
            item.dataset.costType = button.dataset.costType;
            renderAllChefCostOptions();

            const input = item.querySelector('input');
            input.disabled = false;
            input.focus();
            updateMapChefCostSummary();
            updateAffordability();
            atualizarResultados();
        });
    });

    // --- Map Chef item inputs ---
    document.querySelectorAll('.map-chef-item').forEach(item => {
        const input = item.querySelector('input');
        if (!input) return;

        input.addEventListener('change', () => {
            // Snap to multiples of 10
            let val = Number(input.value) || 0;
            if (val < 0) val = 0;
            val = Math.round(val / 10) * 10;
            input.value = val;

            // Check affordability: cannot spend more than you have
            const costType   = getChefCostType(item);
            const costAmount = getChefCostAmount(item);
            if (!costType || !costAmount) return;

            // Tally costs from OTHER chef items
            const selectedChef = item.closest('.chef-card');
            let otherCosts = 0;
            getActiveChefCards().flatMap(card => [...card.querySelectorAll('.map-chef-item')]).forEach(other => {
                if (other === item) return;
                const otherVal = Number(other.querySelector('input').value) || 0;
                if (otherVal > 0 && getChefCostType(other) === costType) {
                    otherCosts += Math.floor(otherVal / 10) * getChefCostAmount(other);
                }
            });

            const rawAvailable = chefDoesNotUseRegularIngredients(selectedChef) ? Infinity : getRawRegularQty(costType);
            const canSpend     = rawAvailable - otherCosts;
            const maxBatches   = Math.max(0, Math.floor(canSpend / costAmount));
            const maxQty       = maxBatches * 10;

            if (val > maxQty) {
                val = maxQty;
                input.value = val;
            }

            item.style.borderColor = val > 0 ? '#f59e0b' : '';
            updateMapChefCostSummary();
            updateAffordability();
            atualizarResultados();
        });
    });

    // --- Day buttons ---
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.getAttribute('data-day');
            if (selectedDay === day) {
                selectedDay = null;
                document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            } else {
                selectedDay = day;
                document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            atualizarResultados();
        });
    });
});

// ============================================================
// START
// ============================================================

carregarDados();
