const ICONES_INGREDIENTES = {
    Ovo: '🥚',
    Trigo: '🌾',
    Alface: '🥬',
    Carne: '🥩',
    Leite: '🥛',
    Manjericão: '🌿',
    Cacau: '🍫',
    Caviar: '🥄',
    Queijo: '🧀',
    Pimenta: '🌶️',
    'Favo de mel': '🍯',
    Trufa: '🍄',
    Atum: '🐟',
    Milho: '🌽',
    Amendoim: '🥜',
    Batata: '🥔',
    Arroz: '🍚',
    Camarão: '🦐',
    Morango: '🍓',
    'Cana-de-açúcar': '🎋',
    Tomate: '🍅'
};

const IMAGENS_INGREDIENTES = {
    Trigo: 'Trigo',
    Carne: 'Carne',
    Alface: 'Alface',
    Leite: 'Leite',
    Ovo: 'Ovo',
    Batata: 'Batata',
    Tomate: 'Tomate',
    Camarão: 'Camarão',
    Arroz: 'Arroz',
    Amendoim: 'Amendoim',
    Milho: 'Milho',
    Morango: 'Morango',
    'Cana-de-açúcar': 'Cana-de-açúcar',
    Queijo: 'Queijo',
    Pimenta: 'Pimenta',
    Atum: 'Atum',
    Manjericão: 'Manjericão',
    Cacau: 'Cacau',
    Caviar: 'Caviar',
    Trufa: 'Trufa',
    'Favo de mel': 'Favo de mel'
};

const TIPOS = [
    { nome: 'Entrada', titulo: 'Entradas', icone: '🥗' },
    { nome: 'Prato Principal', titulo: 'Pratos principais', icone: '🍖' },
    { nome: 'Sobremesa', titulo: 'Sobremesas', icone: '🍰' }
];

const GRUPOS_INGREDIENTES = [
    { titulo: 'Regulares', ingredientes: ['Ovo', 'Trigo', 'Alface', 'Carne', 'Leite'] },
    { titulo: 'Ingredientes de chef', ingredientes: ['Morango', 'Cana-de-açúcar', 'Milho', 'Amendoim', 'Camarão', 'Arroz', 'Batata', 'Tomate'] },
    { titulo: 'Especiais', ingredientes: ['Manjericão', 'Cacau', 'Caviar', 'Queijo', 'Pimenta', 'Favo de mel', 'Trufa', 'Atum'] }
];

let receitas = [];
let categoriaAtual = 'Todas';
let raridadeAtual = 'Todas';
const ingredientesAtivos = new Set();

const catalogo = document.getElementById('recipe-catalog');
const status = document.getElementById('catalog-status');
const busca = document.getElementById('recipe-search');
const filtrosIngredientes = document.getElementById('ingredient-filters');
const filtroRaridade = document.getElementById('rarity-filter');
const modal = document.getElementById('recipe-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function contarIngredientes(ingredientes) {
    return ingredientes.reduce((contagem, ingrediente) => {
        contagem[ingrediente] = (contagem[ingrediente] || 0) + 1;
        return contagem;
    }, {});
}

function listaDeIngredientes(receita) {
    return Object.entries(contarIngredientes(receita.ingredientes)).map(([ingrediente, quantidade]) => {
        const icone = ICONES_INGREDIENTES[ingrediente] || '🍴';
        const imagem = IMAGENS_INGREDIENTES[ingrediente];
        const visual = imagem
            ? `<img src="assets/ingredients/${imagem}.png" alt="" loading="lazy">`
            : icone;
        return `<li>${visual}<span>${ingrediente} <strong class="ingredient-quantity">×${quantidade}</strong></span></li>`;
    }).join('');
}

function classeDeRaridade(raridade) {
    const normalizada = raridade.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalizada.includes('comum')) return 'common';
    if (normalizada.includes('excelente') || normalizada.includes('rare')) return 'rare';
    if (normalizada.includes('epic') || normalizada.includes('epica') || normalizada.includes('epico')) return 'epic';
    if (normalizada.includes('legend') || normalizada.includes('lendaria') || normalizada.includes('lendario')) return 'legendary';
    if (normalizada.includes('myth') || normalizada.includes('mitica') || normalizada.includes('mitico') || normalizada.includes('immortal')) return 'mythic';
    return 'default';
}

function preencherFiltroDeRaridades() {
    const raridades = [...new Set(receitas.map(receita => receita.raridade))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    filtroRaridade.innerHTML = '<option value="Todas">Todas</option>';
    raridades.forEach(raridade => filtroRaridade.add(new Option(raridade, raridade)));
}

function receitaCombina(receita, texto) {
    const alvo = texto.trim().toLocaleLowerCase('pt-BR');
    if (!alvo) return true;
    return receita.nome.toLocaleLowerCase('pt-BR').includes(alvo) ||
        receita.ingredientes.some(ingrediente => ingrediente.toLocaleLowerCase('pt-BR').includes(alvo));
}

function preencherFiltroDeIngredientes() {
    filtrosIngredientes.innerHTML = '';
    GRUPOS_INGREDIENTES.forEach(grupo => {
        const group = document.createElement('section');
        group.className = 'ingredient-filter-group';
        group.innerHTML = `<h3>${grupo.titulo}</h3><div class="ingredient-filters-row"></div>`;
        const row = group.querySelector('.ingredient-filters-row');

        grupo.ingredientes.forEach(ingrediente => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ingredient-filter-btn';
            button.dataset.ingredient = ingrediente;
            button.setAttribute('aria-pressed', 'false');
            const imagem = IMAGENS_INGREDIENTES[ingrediente];
            button.innerHTML = imagem
                ? `<img src="assets/ingredients/${imagem}.png" alt=""> <span>${ingrediente}</span>`
                : `<span>${ICONES_INGREDIENTES[ingrediente] || '🍴'} ${ingrediente}</span>`;
            button.addEventListener('click', () => {
                if (ingredientesAtivos.has(ingrediente)) {
                    ingredientesAtivos.delete(ingrediente);
                    button.classList.remove('active');
                    button.setAttribute('aria-pressed', 'false');
                } else {
                    ingredientesAtivos.add(ingrediente);
                    button.classList.add('active');
                    button.setAttribute('aria-pressed', 'true');
                }
                renderizarCatalogo();
            });
            row.appendChild(button);
        });
        filtrosIngredientes.appendChild(group);
    });
}

function renderizarCatalogo() {
    const texto = busca.value;
    const receitasFiltradas = receitas.filter(receita => {
        const categoriaOk = categoriaAtual === 'Todas' || receita.tipo === categoriaAtual;
        const raridadeOk = raridadeAtual === 'Todas' || receita.raridade === raridadeAtual;
        const ingredienteOk = [...ingredientesAtivos].every(ingrediente => receita.ingredientes.includes(ingrediente));
        return categoriaOk && raridadeOk && ingredienteOk && receitaCombina(receita, texto);
    });

    catalogo.innerHTML = '';
    status.textContent = receitasFiltradas.length
        ? `${receitasFiltradas.length} receita${receitasFiltradas.length === 1 ? '' : 's'} encontrada${receitasFiltradas.length === 1 ? '' : 's'}.`
        : 'Nenhuma receita encontrada com esses filtros.';

    TIPOS.forEach(tipo => {
        if (categoriaAtual !== 'Todas' && categoriaAtual !== tipo.nome) return;
        const itens = receitasFiltradas.filter(receita => receita.tipo === tipo.nome);
        if (!itens.length) return;

        const section = document.createElement('section');
        section.className = 'recipe-category';
        section.innerHTML = `<div class="category-heading"><h2>${tipo.icone} ${tipo.titulo}</h2><span>${itens.length}</span></div><div class="recipe-grid"></div>`;
        const grid = section.querySelector('.recipe-grid');

        itens.forEach(receita => {
            const card = document.createElement('article');
            card.className = `catalog-card rarity-${classeDeRaridade(receita.raridade)}`;
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Ver detalhes de ${receita.nome}`);
            card.innerHTML = [
                `<img src="assets/recipes/recipe-${receita.id}.png" alt="${receita.nome}" loading="lazy">`,
                '<div class="catalog-card-body">',
                `<p class="recipe-rarity">${receita.raridade}</p>`,
                `<h3>${receita.nome}</h3>`,
                `<ul class="ingredient-costs">${listaDeIngredientes(receita)}</ul>`,
                '</div>'
            ].join('');
            card.addEventListener('click', () => abrirDetalhes(receita));
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    abrirDetalhes(receita);
                }
            });
            grid.appendChild(card);
        });

        catalogo.appendChild(section);
    });
}

async function carregarCatalogo() {
    try {
            const receitasResponse = await fetch('receitas.json');
            if (!receitasResponse.ok) throw new Error('Falha ao carregar as receitas');
        receitas = await receitasResponse.json();
        preencherFiltroDeIngredientes();
        preencherFiltroDeRaridades();
        renderizarCatalogo();
    } catch (error) {
        status.textContent = 'Não foi possível carregar o catálogo de receitas.';
        console.error(error);
    }
}

document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        categoriaAtual = button.dataset.category;
        document.querySelectorAll('.category-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderizarCatalogo();
    });
});

busca.addEventListener('input', renderizarCatalogo);
filtroRaridade.addEventListener('change', () => {
    raridadeAtual = filtroRaridade.value;
    renderizarCatalogo();
});

function abrirDetalhes(receita) {
    modalContent.innerHTML = [
        `<img class="modal-image" src="assets/recipes/recipe-${receita.id}.png" alt="${receita.nome}">`,
        `<p class="recipe-rarity rarity-text-${classeDeRaridade(receita.raridade)}">${receita.raridade}</p>`,
        `<h2>${receita.nome}</h2>`,
        `<p class="modal-category">${receita.tipo}</p>`,
        `<h3>Ingredientes</h3>`,
        `<ul class="modal-ingredients">${listaDeIngredientes(receita)}</ul>`,
        receita.tipo_efeito ? `<p class="modal-detail"><strong>Efeito:</strong> ${receita.tipo_efeito}</p>` : '',
        receita.porcentagem ? `<p class="modal-detail"><strong>Bônus:</strong> ${(Number(receita.porcentagem) * 100).toLocaleString('pt-BR')}%</p>` : '',
        receita.emblema_do_heroi ? `<p class="modal-detail"><strong>Emblema do herói:</strong> ${receita.emblema_do_heroi}</p>` : ''
    ].join('');
    modal.showModal();
}

modalClose.addEventListener('click', () => modal.close());
modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
});
carregarCatalogo();
