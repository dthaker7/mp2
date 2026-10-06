import { useEffect, useMemo, useState } from "react";
import Gallery from "../components/Gallery";
import ListView from "../components/ListView";
import { getPokemonList } from "../api/pokemonApi";
import type { PokemonListItem } from "../types/pokemon";

type ViewMode = "list" | "gallery";
type SortBy = "id" | "name";
type SortOrder = "asc" | "desc";

function Home() {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState<SortBy>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);
        setError("");

        const data = await getPokemonList();

        setPokemon(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load Pokémon.");
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, []);

  const allTypes = useMemo(() => {
    return Array.from(
      new Set(pokemon.flatMap((item) => item.types))
    ).sort();
  }, [pokemon]);

  const allRegions = useMemo(() => {
    return Array.from(
      new Set(pokemon.map((item) => item.region))
    ).sort();
  }, [pokemon]);

  function toggleType(type: string) {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  }

  function toggleRegion(region: string) {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region]
    );
  }

  if (loading) {
    return <main>Loading Pokémon...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  return (
    <main>
      <header>
        <h1>Pokédex</h1>

        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div>
          <button onClick={() => setViewMode("list")}>
            List
          </button>

          <button onClick={() => setViewMode("gallery")}>
            Gallery
          </button>
        </div>
      </header>

      {viewMode === "list" && (
        <section>
          <label>
            Sort by:
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as SortBy)
              }
            >
              <option value="id">ID</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label>
            Order:
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </section>
      )}

      {viewMode === "gallery" && (
        <section>
          <h2>Filter by Type</h2>

          <div>
            {allTypes.map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                />
                {type}
              </label>
            ))}
          </div>

          <h2>Filter by Region</h2>

          <div>
            {allRegions.map((region) => (
              <label key={region}>
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleRegion(region)}
                />
                {region}
              </label>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedTypes([]);
              setSelectedRegions([]);
            }}
          >
            Clear Filters
          </button>
        </section>
      )}

      {viewMode === "list" ? (
        <ListView
          pokemon={pokemon}
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ) : (
        <Gallery
          pokemon={pokemon}
          selectedTypes={selectedTypes}
          selectedRegions={selectedRegions}
        />
      )}
    </main>
  );
}

export default Home;