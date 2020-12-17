const input = require("readline-sync")
const axios = require("axios")

// coleção

let game_collection = [{
  name: 'Metal Gear Solid 4: Guns of the Patriots',
  released: '2008-06-12',
  platform: 'PS3'
},
{
  name: 'The Legend of Zelda',
  released: '1986-02-21',
  platform: '3DSE'
}]

// funções auxiliares

const header = (texto) => {
  console.log("")
  console.log("=".repeat(texto.length))
  console.log(texto)
  console.log("=".repeat(texto.length))
}

const menu_principal = () => {
  header("Game Collection")
  console.log("")
  console.log("1. Mostrar coleção")
  console.log("2. Adicionar jogo")
  console.log("3. Remover jogo")
  console.log("0. Sair")
  console.log("")
}

const selecao_numerica = (texto, vetor) => {
  let selecao
  do {
    selecao = parseInt(input.questionInt(`\n${texto}`)) - 1
  } while (selecao > vetor.length)
  return selecao
}

const show_games = (lista) => {
  lista.map((game, index) => console.log(`${index + 1}. ${game.released.slice(0, 4)} | ${game.name} | ${game.platform}`))
}

const paginacao = (lista, per_step, chave) => {
  let count = 0
  let count_mostrados = 0
  let mostra_mais
  do {
    console.log("")
    for (let i = 0 + count; i < per_step + count && i < lista.length; i++) {
      console.log(`${i + 1}. ${lista[i][chave]}`)
      count_mostrados++
    }
    if (lista.length > per_step && lista.length - count > per_step) {
      do {
        mostra_mais = (input.question(`\nMostrar mais resultados? (s/n): `)).toLowerCase()
      } while (mostra_mais.toLowerCase() !== "s" && mostra_mais.toLowerCase() !== "n")
      if (mostra_mais.toLowerCase() === "s") count += per_step
    } else { mostra_mais = "n" }
  } while (mostra_mais.toLowerCase() === "s" && count < lista.length)
  // console.log(count_mostrados)
  return count_mostrados
}

// acessando a API

async function get_games() {
  let game = input.question("\nDigite o nome de um jogo: ")
  console.log("")
  console.log(`Buscando "${game}"...`)
  console.log("")
  let games_encontrados = await axios.get(`https://www.giantbomb.com/api/games/?api_key=8fbb511ce41111905e37856490cf46c0c3c483e3&format=json&filter=name:${game}`)
    .then(resposta_da_api => (resposta_da_api.data))
    .then(
      games_recebidos => games_recebidos.results.map(
        game_recebido => ({
          // guid: game_recebido.guid,
          name: game_recebido.name,
          released: game_recebido.original_release_date,
          platform: game_recebido.platforms
        })))
    .catch(erro => console.log(erro))

  games_encontrados = games_encontrados.map((game) => ({
    ...game,
    released: game.released ? game.released : '????',
    platform: game.platform ? game.platform.map(platform => platform.abbreviation) : ['????']
  }))

  // console.log(games_encontrados)

  if (games_encontrados.length >= 100) {
    console.log(`-> Mais de 100 resultados para o termo "${game}"`)
  }
  else {
    console.log(`-> ${games_encontrados.length} resultado(s) para o termo "${game}"`)
  }
  return games_encontrados
}

// função principal

let selecao
async function main() {

  do {

    menu_principal()
    selecao = input.question("Escolha uma opção: ")

    // opção 1

    if (selecao == "1") {
      header("1. Minha coleção")
      if (game_collection.length === 0) console.log(`\nSua coleção está vazia :(`)
      else {
        // console.log("")
        // console.log(game_collection)
        console.log("")
        show_games(game_collection)
      }
    }

    // opção 2

    else if (selecao == "2") {
      header("2. Adicionar jogo")
      let selecao_2 = 2
      do {
        let game_list
        do {
          game_list = await get_games()
        } while (game_list.length <= 0)
        let game
        if (game_list.length > 1) {
          let limite_selecao = paginacao(game_list, 7, "name")
          do {
            game = parseInt(input.questionInt(`\nSelecione um jogo: `)) - 1
          } while (game > limite_selecao)
        }
        else { game = 0 }
        console.log(`\n-> "${game_list[game].name}"`)
        console.log(`\n1. Adicionar este jogo à sua coleção`)
        console.log(`2. Buscar novamente`)
        console.log(`0. Voltar`)
        do {
          selecao_2 = input.question("\nE agora? ")
          if (selecao_2 == "1") {
            if (game_list[game].platform.length > 1) {
              console.log("")
              game_list[game].platform.map((plataforma, index) => console.log(`${index + 1}. ${plataforma}`))
              let selecao_plataforma = parseInt(input.question(`\nSelecione uma plataforma: `)) - 1
              game_list[game].platform = game_list[game].platform[selecao_plataforma]
            } else { game_list[game].platform = game_list[game].platform[0] }
            game_collection.push(game_list[game])
            console.log(`\nJogo adicionado à coleção com sucesso!`)
            selecao_2 = 0
          }
        } while (selecao_2 != "1" && selecao_2 != "2" && selecao_2 != "0")
      } while (selecao_2 != "0")
    }

    // opção 3

    else if (selecao == "3") {
      header("3. Remover jogo")
      if (game_collection.length === 0) console.log(`\nSua coleção está vazia :(`)
      else {
        console.log("")
        show_games(game_collection)
        let remove_game = selecao_numerica("Selecione um jogo para remover: ", game_collection)
        game_collection.splice(remove_game, 1)
        console.log(`\nJogo removido da coleção com sucesso!`)
      }
    }

  } while (selecao != "0")

}

main()