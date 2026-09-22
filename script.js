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
                fetch("receitas.json"),
                fetch("ingredientes.json")
            ]);


        if (!receitasResponse.ok) {
            throw new Error("Não foi possível carregar receitas.json");
        }


        if (!ingredientesResponse.ok) {
            throw new Error("Não foi possível carregar ingredientes.json");
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

carregarDados();
