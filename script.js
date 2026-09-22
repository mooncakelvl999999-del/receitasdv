let receitas = [];
let unidadesIngredientes = {};

const resultados = document.getElementById("results");


// ============================================================
// CARREGAR OS ARQUIVOS JSON
// ============================================================

async function carregarDados() {

    try {

        const [receitasResponse, ingredientesResponse] =
            await Promise.all([
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

        unidadesIngredientes =
            await ingredientesResponse.json();


        configurarCampos();

        atualizarResultados();


    } catch (erro) {

        console.error(erro);

        resultados.innerHTML = `
            <h2>🍽️ Pratos possíveis</h2>

            <p class="empty-message">
                Erro ao carregar os arquivos de receitas.
            </p>
        `;
    }
}


// ============================================================
// CONFIGURAR OS CAMPOS DOS INGREDIENTES
// ============================================================

function configurarCampos() {

    Object.keys(unidadesIngredientes).forEach(ingrediente => {

        const campo = document.getElementById(ingrediente);

        if (!campo) {
            console.warn(
                `Campo não encontrado para o ingrediente: ${ingrediente}`
            );

            return;
        }


        // Atualiza enquanto a pessoa digita
        campo.addEventListener(
            "input",
            atualizarResultados
        );


        // Também atualiza caso o valor seja alterado
        // por outro método
        campo.addEventListener(
            "change",
            atualizarResultados
        );

    });
}


// ============================================================
// OBTER O INVENTÁRIO DO JOGADOR
// ============================================================

function obterInventario() {

    const inventario = {};


    Object.keys(unidadesIngredientes).forEach(ingrediente => {

        const campo =
            document.getElementById(ingrediente);


        if (!campo) {
            return;
        }


        const quantidadeBruta =
            Number(campo.value) || 0;


        const unidadesPorPorcao =
            Number(unidadesIngredientes[ingrediente]);


        if (
            quantidadeBruta <= 0 ||
            unidadesPorPorcao <= 0
        ) {

            inventario[ingrediente] = 0;

            return;
        }


        /*
         * Converte a quantidade bruta do inventário
         * para unidades utilizáveis na receita.
         *
         * Exemplos:
         *
         * 350 Trigo / 100 = 3
         *
         * 22 Carne / 10 = 2
         *
         * 35 Milho / 10 = 3
         */

        inventario[ingrediente] =
            Math.floor(
                quantidadeBruta / unidadesPorPorcao
            );

    });


    return inventario;
}


// ============================================================
// CONTAR INGREDIENTES REPETIDOS
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
// CALCULAR QUANTAS VEZES A RECEITA PODE SER FEITA
// ============================================================

function calcularPorcoes(
    receita,
    inventario
) {

    const ingredientesNecessarios =
        contarIngredientes(
            receita.ingredientes
        );


    let quantidadeMaxima = Infinity;


    for (
        const [ingrediente, quantidadeNecessaria]
        of Object.entries(ingredientesNecessarios)
    ) {

        const disponivel =
            inventario[ingrediente] || 0;


        /*
         * Exemplo:
         *
         * Receita:
         * Ovo ×2
         * Trigo ×2
         *
         * Inventário:
         * Ovo = 10
         * Trigo = 3
         *
         * Ovo:
         * 10 / 2 = 5
         *
         * Trigo:
         * 3 / 2 = 1
         *
         * Resultado:
         * 1 receita
         */

        const possiveis =
            Math.floor(
                disponivel /
                quantidadeNecessaria
            );


        quantidadeMaxima =
            Math.min(
                quantidadeMaxima,
                possiveis
            );


        // Se faltar um ingrediente,
        // não é possível preparar a receita.

        if (quantidadeMaxima === 0) {
            return 0;
        }

    }


    return quantidadeMaxima;
}


// ============================================================
// CRIAR TEXTO DOS INGREDIENTES DA RECEITA
// ============================================================

function formatarIngredientes(
    ingredientes
) {

    const contagem =
        contarIngredientes(
            ingredientes
        );


    return Object.entries(contagem)
        .map(
            ([ingrediente, quantidade]) => {

                if (quantidade === 1) {
                    return ingrediente;
                }

                return `${ingrediente} ×${quantidade}`;

            }
        )
        .join(", ");
}


// ============================================================
// ATUALIZAR PAINEL DE RESULTADOS
// ============================================================

function atualizarResultados() {

    const inventario =
        obterInventario();


    const receitasPossiveis =
        receitas
            .map(receita => {

                const porcoes =
                    calcularPorcoes(
                        receita,
                        inventario
                    );


                return {
                    receita,
                    porcoes
                };

            })
            .filter(
                item => item.porcoes > 0
            );


    // ========================================================
    // NENHUMA RECEITA DISPONÍVEL
    // ========================================================

    if (receitasPossiveis.length === 0) {

        resultados.innerHTML = `
            <h2>🍽️ Pratos possíveis</h2>

            <p class="empty-message">
                Informe seus ingredientes para descobrir
                quais pratos você consegue preparar.
            </p>
        `;

        return;
    }


    // ========================================================
    // CABEÇALHO
    // ========================================================

    resultados.innerHTML = `
        <h2>🍽️ Pratos possíveis</h2>
    `;


    // ========================================================
    // CRIAR OS CARDS
    // ========================================================

    receitasPossiveis.forEach(
        ({ receita, porcoes }) => {

            const card =
                document.createElement("article");


            card.className = "recipe";


            const ingredientes =
                formatarIngredientes(
                    receita.ingredientes
                );


            card.innerHTML = `

                <h3>
                    ${receita.nome}
                </h3>


                <div class="recipe-info">
                    ${receita.tipo}
                    •
                    ${receita.raridade}
                </div>


                <div class="recipe-portions">
                    🍽️ Pode fazer: ${porcoes}x
                </div>


                <div class="recipe-ingredients">
                    ${ingredientes}
                </div>

            `;


            resultados.appendChild(card);

        }
    );

}


// ============================================================
// INICIAR
// ============================================================

carregarDados();let receitas = [];
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
