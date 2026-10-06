import { Link } from "react-router-dom";
import type { PokemonListItem } from "../types/pokemon";

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Link to={`/pokemon/${pokemon.id}`}>
      <article>
        <img src={pokemon.image} alt={pokemon.name} />

        <p>#{String(pokemon.id).padStart(4, "0")}</p>

        <h2>{pokemon.name}</h2>

        <p>{pokemon.region}</p>

        <div>
          {pokemon.types.map((type) => (
            <span key={type}>{type} </span>
          ))}
        </div>
      </article>
    </Link>
  );
}

export default PokemonCard;