import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPokemonById } from "../api/pokemonApi";
import type { Pokemon } from "../types/pokemon";

const TOTAL_POKEMON = 1025;

function PokemonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pokemonId = Number(id);

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);
        setError("");

        const data = await getPokemonById(pokemonId);

        setPokemon(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load Pokémon.");
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, [pokemonId]);

  if (loading) {
    return <main>Loading Pokémon...</main>;
  }

  if (error || !pokemon) {
    return (
      <main>
        <p>{error || "Pokémon not found."}</p>
        <Link to="/">Back to Pokédex</Link>
      </main>
    );
  }

  function goToPrevious() {
    if (pokemonId > 1) {
      navigate(`/pokemon/${pokemonId - 1}`);
    }
  }

  function goToNext() {
    if (pokemonId < TOTAL_POKEMON) {
      navigate(`/pokemon/${pokemonId + 1}`);
    }
  }

  return (
    <main>
      <Link to="/">← Back to Pokédex</Link>

      <section>
        <p>#{String(pokemon.id).padStart(4, "0")}</p>

        <h1>{pokemon.name}</h1>

        <p>Region: {pokemon.region}</p>

        <img src={pokemon.image} alt={pokemon.name} />

        <h2>Types</h2>

        <div>
          {pokemon.types.map((type) => (
            <span key={type}>{type} </span>
          ))}
        </div>

        <h2>Abilities</h2>

        <ul>
          {pokemon.abilities.map((ability) => (
            <li key={ability}>{ability}</li>
          ))}
        </ul>

        <h2>Physical Information</h2>

        <p>Height: {pokemon.height}</p>
        <p>Weight: {pokemon.weight}</p>

        <h2>Base Stats</h2>

        <ul>
          {pokemon.stats.map((stat) => (
            <li key={stat.name}>
              {stat.name}: {stat.value}
            </li>
          ))}
        </ul>
      </section>

      <nav>
        <button
          onClick={goToPrevious}
          disabled={pokemonId <= 1}
        >
          ← Previous
        </button>

        <button
          onClick={goToNext}
          disabled={pokemonId >= TOTAL_POKEMON}
        >
          Next →
        </button>
      </nav>
    </main>
  );
}

export default PokemonDetails;