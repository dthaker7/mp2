import { Link } from "react-router-dom";
import type { PokemonListItem } from "../types/pokemon";

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

function PokemonCard({ pokemon }: PokemonCardProps) {
  const primary = (pokemon.types[0] ?? "normal").toLowerCase();

  return (
    <Link to={`/pokemon/${pokemon.id}`}>
      <article className={`card t-${primary}`}>
        <div className="card-img">
          <span className="fx" aria-hidden="true" />
          <img src={pokemon.image} alt={pokemon.name} loading="lazy" />
        </div>

        <div className="card-info">
          <p className="card-id">#{String(pokemon.id).padStart(4, "0")}</p>
          <h2 className="card-name">{pokemon.name}</h2>
          <p className="card-region">{pokemon.region}</p>

          <div className="types">
            {pokemon.types.map((type) => (
              <span key={type} className={`type type-${type.toLowerCase()}`}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PokemonCard;