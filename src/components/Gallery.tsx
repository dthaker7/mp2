import PokemonCard from "./PokemonCard";
import type { PokemonListItem } from "../types/pokemon";

interface GalleryProps {
  pokemon: PokemonListItem[];
  selectedTypes: string[];
  selectedRegions: string[];
}

function Gallery({
  pokemon,
  selectedTypes,
  selectedRegions,
}: GalleryProps) {
  const filteredPokemon = pokemon.filter((item) => {
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.every((type) => item.types.includes(type));

    const matchesRegion =
      selectedRegions.length === 0 ||
      selectedRegions.includes(item.region);

    return matchesType && matchesRegion;
  });

  return (
    <section>
      <p>{filteredPokemon.length} Pokémon found</p>

      <div>
        {filteredPokemon.map((item) => (
          <PokemonCard key={item.id} pokemon={item} />
        ))}
      </div>
    </section>
  );
}

export default Gallery;