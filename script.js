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
        if (val > 0 && !chefDoesNotUseRegularIngredients(chef)) {
            const batches    = Math.floor(val / 10);
            const costType   = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            committed[costType] = (committed[costType] || 0) + (batches * costAmount);
        }
    });

    allChefItems.forEach(item => {
        const chef        = item.closest('.chef-card');
        const input      = item.querySelector('input');
        const val        = Number(input.value) || 0;
        const costType   = item.getAttribute('data-cost-type');
        const costAmount = Number(item.getAttribute('data-cost-amount'));

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
        let warning = item.querySelector('.ingredient-warning');
        if (!warning) {
            warning = document.createElement('small');
            warning.className = 'ingredient-warning';
            item.appendChild(warning);
        }

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
            const costType   = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
            const gainId     = item.getAttribute('data-id');
            if (!chefDoesNotUseRegularIngredients(chef)) {
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
        if (val > 0) {
            const batches    = Math.floor(val / 10);
            const costType   = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));
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
        if (!options.has(item.dataset.id)) {
            options.set(item.dataset.id, {
                costType: item.dataset.costType,
                costAmount: Number(item.dataset.costAmount),
                chefName: item.closest('.chef-card').querySelector('.chef-header').textContent.trim()
            });
        }
    }));

    const currentCosts = {};
    activeChefs.forEach(chef => {
        if (chefDoesNotUseRegularIngredients(chef)) return;
        chef.querySelectorAll('.map-chef-item').forEach(item => {
            const quantity = Number(item.querySelector('input').value) || 0;
            if (quantity > 0) {
                const batches = Math.floor(quantity / 10);
                currentCosts[item.dataset.costType] = (currentCosts[item.dataset.costType] || 0) + batches * Number(item.dataset.costAmount);
            }
        });
    });

    const trades = [];
    const needed = contarIngredientes(receita.ingredientes);
    for (const [ingredient, quantity] of Object.entries(needed)) {
        const missing = quantity - (inventario[ingredient] || 0);
        if (missing <= 0) continue;
        const option = options.get(ingredient);
        if (!option) return null;
        const batches = Math.ceil(missing / 10);
        const cost = batches * option.costAmount;
        currentCosts[option.costType] = (currentCosts[option.costType] || 0) + cost;
        trades.push({ ingredient, quantity: missing, cost, costType: option.costType, chefName: option.chefName });
    }

    if (!trades.length) return null;
    if (Object.entries(currentCosts).some(([type, cost]) => getRawRegularQty(type) < cost)) return null;
    return trades;
}

function criarCardDeReceita(receita, porcoes, trades = null) {
    const isSuggestion = Boolean(trades);
    const card = document.createElement('article');
    card.className = 'recipe' + (isSuggestion ? ' recipe-suggestion' : '');
    card.innerHTML = [
        '<img class="recipe-image" src="assets/recipes/recipe-' + receita.id + '.png" alt="' + receita.nome + '">',
        '<h3>' + receita.nome + '</h3>',
        '<div class="recipe-info">' + receita.tipo + ' &bull; ' + receita.raridade + '</div>',
        isSuggestion ? '<div class="trade-suggestion">Troque ' + trades.map(trade => trade.quantity + 'x ' + trade.ingredient + ' com ' + trade.chefName).join(' e ') + '</div>' : '',
        '<div class="recipe-ingredients">' + formatarIngredientes(receita.ingredientes) + '</div>'
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
            const costType   = item.getAttribute('data-cost-type');
            const costAmount = Number(item.getAttribute('data-cost-amount'));

            // Tally costs from OTHER chef items
            const selectedChef = item.closest('.chef-card');
            let otherCosts = 0;
            getActiveChefCards().flatMap(card => [...card.querySelectorAll('.map-chef-item')]).forEach(other => {
                if (other === item) return;
                const otherVal = Number(other.querySelector('input').value) || 0;
                if (otherVal > 0 && other.getAttribute('data-cost-type') === costType) {
                    otherCosts += Math.floor(otherVal / 10) * Number(other.getAttribute('data-cost-amount'));
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
