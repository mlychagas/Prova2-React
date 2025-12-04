import { useState } from 'react'
import './App.css'
import PokemonCard from './components/PokemonCard'

function App() {
  const [pokemon, setPokemon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Função para buscar pokemon por nome completo ou iniciais
  const buscarPokemon = async (nome) => {
    if (!nome) {
      setError('Por favor, digite um nome de pokemon')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Primeiro tenta buscar pelo nome exato
      let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`)
      
      // Se não encontrar, busca por iniciais
      if (!response.ok) {
        // Busca lista de pokemons e filtra por iniciais
        const listResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
        if (!listResponse.ok) {
          throw new Error('Erro ao buscar lista de pokemons')
        }
        
        const listData = await listResponse.json()
        const pokemonEncontrado = listData.results.find(p => 
          p.name.toLowerCase().startsWith(nome.toLowerCase())
        )
        
        if (!pokemonEncontrado) {
          throw new Error('Pokemon não encontrado!')
        }
        
        // Busca os dados completos do pokemon encontrado
        response = await fetch(pokemonEncontrado.url)
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do pokemon')
        }
      }

      const data = await response.json()
      setPokemon(data)
    } catch (err) {
      setError(err.message || 'Erro ao buscar pokemon')
      setPokemon(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    buscarPokemon(searchTerm)
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="titulo-principal">🔍 Buscador de Pokemon</h1>
        <p className="subtitulo">Encontre seu Pokemon favorito!</p>
      </header>

      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Digite o nome ou iniciais do Pokemon (ex: pika ou pikachu)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="erro-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Carregando pokemon...</p>
        </div>
      )}

      {pokemon && !loading && (
        <PokemonCard pokemon={pokemon} />
      )}

      {!pokemon && !loading && !error && (
        <div className="welcome-message">
          <p>👋 Bem vindo! Digite o nome de um Pokemon para começar.</p>
        </div>
      )}
    </div>
  )
}

export default App
