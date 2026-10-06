import { useEffect, useMemo, useState } from "react";
import Gallery from "../components/Gallery";
import ListView from "../components/ListView";
import Loader from "../components/Loader";
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
    return (
      <div className="app">
        <div className="device status-box">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="device status-box">
          <div className="status">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="device">
        <header className="device-top">
          <div className="lens" />
          <div className="leds">
            <span className="led r" />
            <span className="led y" />
            <span className="led g" />
          </div>

          <h1 className="title">Pokédex</h1>

          <input
            className="search"
            type="text"
            placeholder="Search Pokémon..."
            aria-label="Search Pokémon"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </header>

        <main className="device-body">
          <div className="toolbar">
            <div className="toggle">
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                List
              </button>

              <button
                className={viewMode === "gallery" ? "active" : ""}
                onClick={() => setViewMode("gallery")}
              >
                Gallery
              </button>
            </div>

            {viewMode === "list" && (
              <>
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
              </>
            )}
          </div>

          {viewMode === "gallery" && (
            <section className="toolbar filters">
              <h2>Filter by Type</h2>

              <div className="chip-row">
                {allTypes.map((type) => (
                  <label key={type} className="chip">
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

              <div className="chip-row">
                {allRegions.map((region) => (
                  <label key={region} className="chip">
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
                className="btn"
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
      </div>
    </div>
  );
}

export default Home;