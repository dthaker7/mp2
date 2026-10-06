import { useMemo } from "react";
import PokemonCard from "./PokemonCard";
import type { PokemonListItem } from "../types/pokemon";

interface ListViewProps {
  pokemon: PokemonListItem[];
  searchTerm: string;
  sortBy: "id" | "name";
  sortOrder: "asc" | "desc";
}

function ListView({
  pokemon,
  searchTerm,
  sortBy,
  sortOrder,
}: ListViewProps) {
  const filteredPokemon = useMemo(() => {
    const search = searchTerm.toLowerCase();

    const filtered = pokemon.filter((item) =>
      item.name.toLowerCase().includes(search)
    );

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "id") {
        comparison = a.id - b.id;
      } else {
        comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [pokemon, searchTerm, sortBy, sortOrder]);

  return (
    <section className="screen">
      <p className="count">{filteredPokemon.length} Pokémon found</p>

      <div className="grid">
        {filteredPokemon.map((item) => (
          <PokemonCard key={item.id} pokemon={item} />
        ))}
      </div>
    </section>
  );
}

export default ListView;