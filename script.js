let receitas = [];
let unidadesIngredientes = {};

// Campos de ingrediente
const campos = [
    {
        ingrediente: document.getElementById("ingredient1"),
        quantidade: document.getElementById("quantity1")
    },
    {
        ingrediente: document.getElementById("ingredient2"),
        quantidade: document.getElementById("quantity2")
    },
    {
        ingrediente: document.getElementById("ingredient3"),
        quantidade: document.getElementById("quantity3")
    },
    {
        ingrediente: document.getElementById("ingredient4"),
        quantidade: document.getElementById("quantity4")
    }
];

const resultados = document.getElementById("results");


// ============================================================
// CARREGAR OS ARQUIVOS JSON
// ============================================================

async function carregarDados() {
    try {
        const [receitasResponse, ingredientesResponse] = await Promise.all([
            fetch("recipes.json"),
            fetch("ingredients.json")
        ]);

        if (!receitasResponse.ok) {
            throw new Error("Não foi possível carregar recipes.json");
        }

        if (!ingredientesResponse.ok) {
            throw new Error("Não foi possível carregar ingredients.json");
        }

        receitas = await receitasResponse.json();
        unidadesIngredientes = await ingredientesResponse.json();

        preencherIngredientes();

        atualizarResultados();

    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);

        resultados.innerHTML = `
            <h2>🍽️ Pratos possíveis</h2>
            <p class="empty-message">
                Não foi possível carregar as receitas.
            </p>
        `;
    }
}


// ============================================================
// PREENCHER OS SELECTS
// ============================================================

function preencherIngredientes() {

    const ingredientes = Object.keys(unidadesIngredientes);

    campos.forEach(campo => {

        ingredientes.forEach(nome => {

            const option = document.createElement("option");

            option.value = nome;
            option.textContent = nome;

            campo.ingrediente.appendChild(option);

        });

    });
}


// ============================================================
// LER O INVENTÁRIO DO JOGADOR
// ============================================================

function obterInventario() {

    const inventario = {};

    campos.forEach(campo => {

        const ingrediente = campo.ingrediente.value;
        const quantidadeBruta = Number(campo.quantidade.value) || 0;

        if (!ingrediente || quantidadeBruta <= 0) {
            return;
        }

        const unidadesPorPorcao = unidadesIngredientes[ingrediente];

        if (!unidadesPorPorcao || unidadesPorPorcao <= 0) {
            return;
        }

        /*
         * Converte a quantidade bruta para unidades
         * utilizáveis como ingrediente.
         *
         * Exemplo:
         * 350 Trigo / 100 = 3 unidades
         * 22 Carne / 10 = 2 unidades
         */

        const unidadesDisponiveis = Math.floor(
            quantidadeBruta / unidadesPorPorcao
        );

        /*
         * Se o mesmo ingrediente estiver selecionado
         * em mais de uma caixa, somamos as quantidades.
         */

        if (inventario[ingrediente]) {
            inventario[ingrediente] += unidadesDisponiveis;
        } else {
            inventario[ingrediente] = unidadesDisponiveis;
        }

    });

    return inventario;
}


// ============================================================
// CONTAR INGREDIENTES DE UMA RECEITA
// ============================================================

function contarIngredientes(ingredientes) {

    const contagem = {};

    ingredientes.forEach(ingrediente => {

        if (contagem[ingrediente]) {
            contagem[ingrediente]++;
        } else {
            contagem[ingrediente] = 1;
        }

    });

    return contagem;
}


// ============================================================
// CALCULAR QUANTAS VEZES UMA RECEITA PODE SER FEITA
// ============================================================

function calcularPorcoes(receita, inventario) {

    const ingredientesNecessarios =
        contarIngredientes(receita.ingredientes);

    let quantidadeMaxima = Infinity;

    for (const [ingrediente, quantidadeNecessaria] of
        Object.entries(ingredientesNecessarios)) {

        const disponivel = inventario[ingrediente] || 0;

        /*
         * Exemplo:
         *
         * Receita precisa de:
         * Trigo × 2
         *
         * Jogador possui:
         * Trigo × 3
         *
         * 3 / 2 = 1 receita
         */

        const possiveis = Math.floor(
            disponivel / quantidadeNecessaria
        );

        quantidadeMaxima = Math.min(
            quantidadeMaxima,
            possiveis
        );

        // Se faltar qualquer ingrediente,
        // a receita não pode ser feita.
        if (quantidadeMaxima === 0) {
            return 0;
        }
    }

    return quantidadeMaxima;
}


// ============================================================
// ATUALIZAR OS PRATOS
// ============================================================

function atualizarResultados() {

    const inventario = obterInventario();

    const receitasPossiveis = receitas
        .map(receita => {

            const porcoes = calcularPorcoes(
                receita,
                inventario
            );

            return {
                receita,
                porcoes
            };

        })
        .filter(item => item.porcoes > 0);


    // ========================================================
    // NENHUM PRATO
    // ========================================================

    if (receitasPossiveis.length === 0) {

        resultados.innerHTML = `
            <h2>🍽️ Pratos possíveis</h2>

            <p class="empty-message">
                Adicione seus ingredientes para descobrir
                quais pratos você consegue preparar.
            </p>
        `;

        return;
    }


    // ========================================================
    // MOSTRAR PRATOS
    // ========================================================

    resultados.innerHTML = `
        <h2>🍽️ Pratos possíveis</h2>
    `;


    receitasPossiveis.forEach(({ receita, porcoes }) => {

        const ingredientesContados =
            contarIngredientes(receita.ingredientes);


        const ingredientesTexto =
            Object.entries(ingredientesContados)
                .map(([ingrediente, quantidade]) => {

                    if (quantidade === 1) {
                        return ingrediente;
                    }

                    return `${ingrediente} ×${quantidade}`;

                })
                .join(", ");


        const card = document.createElement("article");

        card.className = "recipe";

        card.innerHTML = `
            <h3>${receita.nome}</h3>

            <div class="recipe-info">
                ${receita.tipo} • ${receita.raridade}
            </div>

            <div class="recipe-portions">
                🍽️ Pode fazer: ${porcoes}x
            </div>

            <div class="recipe-ingredients">
                ${ingredientesTexto}
            </div>
        `;

        resultados.appendChild(card);

    });

}


// ============================================================
// ATUALIZAR AUTOMATICAMENTE
// ============================================================

campos.forEach(campo => {

    campo.ingrediente.addEventListener(
        "change",
        atualizarResultados
    );

    campo.quantidade.addEventListener(
        "input",
        atualizarResultados
    );

});


// ============================================================
// INICIAR
// ============================================================

carregarDados();
