import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getEvolutionChain,
  getMatchups,
  getPokemonById,
  getSpeciesInfo,
} from "../api/pokemonApi";
import Loader from "../components/Loader";
import { playCry } from "../utils/sound";
import type { EvolutionStage, Matchups, Pokemon, SpeciesInfo } from "../types/pokemon";

const TOTAL_POKEMON = 1025;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <div className="device">
        <div className="device-top">
          <div className="lens" />
          <div className="leds">
            <span className="led r" />
            <span className="led y" />
            <span className="led g" />
          </div>
        </div>
        <main className="device-body">{children}</main>
      </div>
    </div>
  );
}

function PokemonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shiny, setShiny] = useState(false);
  const [evolutions, setEvolutions] = useState<EvolutionStage[][]>([]);
  const [matchups, setMatchups] = useState<Matchups | null>(null);
  const [info, setInfo] = useState<SpeciesInfo | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [formPokemon, setFormPokemon] = useState<Pokemon | null>(null);

  const pokemonId = Number(id);

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);
        setError("");
        setShiny(false);
        setFormId(null);

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

  // Evolution chain + Pokédex entry + forms (failures are non-fatal)
  useEffect(() => {
    if (!pokemon) return;
    let cancelled = false;

    setEvolutions([]);
    setInfo(null);

    Promise.all([getEvolutionChain(pokemon.id), getSpeciesInfo(pokemon.id)])
      .then(([chain, speciesInfo]) => {
        if (!cancelled) {
          setEvolutions(chain);
          setInfo(speciesInfo);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [pokemon]);

  // Load the selected form (Mega, Alolan, ...) so its own data is shown
  useEffect(() => {
    if (!pokemon || formId === null) {
      setFormPokemon(null);
      return;
    }
    let cancelled = false;

    getPokemonById(formId, pokemon.id)
      .then((data) => {
        if (!cancelled) setFormPokemon(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setFormId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pokemon, formId]);

  // Whatever is on screen: the selected form, or the base Pokémon
  const shown = formPokemon ?? pokemon;

  // Type matchups follow the types of the form being shown
  useEffect(() => {
    if (!shown) return;
    let cancelled = false;

    setMatchups(null);

    getMatchups(shown.types)
      .then((data) => {
        if (!cancelled) setMatchups(data);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [shown]);

  // Play the API cry when a Pokémon (or one of its forms) is shown
  useEffect(() => {
    if (shown) {
      playCry(shown.cry);
    }
  }, [shown]);

  // Left / right arrow keys for Previous / Next
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;

      if (event.key === "ArrowLeft" && pokemonId > 1) {
        navigate(`/pokemon/${pokemonId - 1}`);
      }
      if (event.key === "ArrowRight" && pokemonId < TOTAL_POKEMON) {
        navigate(`/pokemon/${pokemonId + 1}`);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pokemonId, navigate]);

  if (loading) {
    return (
      <Shell>
        <div className="screen">
          <Loader />
        </div>
      </Shell>
    );
  }

  if (error || !pokemon) {
    return (
      <Shell>
        <div className="screen status">
          <p>{error || "Pokémon not found."}</p>
          <Link to="/" className="back back-light">
            Back to Pokédex
          </Link>
        </div>
      </Shell>
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

  const current = formPokemon ?? pokemon;
  const primaryType = (current.types[0] ?? "normal").toLowerCase();
  const artwork =
    shiny && current.shinyImage ? current.shinyImage : current.image;

  return (
    <Shell>
      <Link to="/" className="back">← Back to Pokédex</Link>

      <section className="detail">
        <div className={`screen detail-visual t-${primaryType}`}>
          <span className="fx" aria-hidden="true" />

          <p className="card-id">#{String(pokemon.id).padStart(4, "0")}</p>

          <h1>{current.name}</h1>

          {info && <p className="card-region">{info.category}</p>}

          <img src={artwork} alt={`${shiny ? "Shiny " : ""}${current.name}`} />

          {info && info.forms.length > 0 && (
            <div className="forms">
              <button
                className={`btn btn-small ${formId === null ? "active" : ""}`}
                aria-pressed={formId === null}
                onClick={() => setFormId(null)}
              >
                Base
              </button>

              {info.forms.map((form) => (
                <button
                  key={form.id}
                  className={`btn btn-small ${formId === form.id ? "active" : ""}`}
                  aria-pressed={formId === form.id}
                  onClick={() => setFormId(form.id)}
                >
                  {form.name.replace(`${pokemon.name} `, "")}
                </button>
              ))}
            </div>
          )}

          <p className="card-region">Region: {pokemon.region}</p>

          <div className="types centered">
            {current.types.map((type) => (
              <span key={type} className={`type type-${type.toLowerCase()}`}>
                {type}
              </span>
            ))}
          </div>

          <div className="actions">
            <button className="btn" onClick={() => playCry(current.cry)}>
              🔊 Play cry
            </button>

            {current.shinyImage && (
              <button
                className="btn"
                aria-pressed={shiny}
                onClick={() => setShiny((current) => !current)}
              >
                {shiny ? "Show normal" : "✨ Show shiny"}
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="panel">
            <h2>Pokédex Entry</h2>
            <p className="description">
              {info ? info.description : "Loading..."}
            </p>
          </div>

          <div className="panel">
            <h2>Abilities</h2>
            <ul>
              {current.abilities.map((ability) => (
                <li key={ability}>{ability}</li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h2>Physical Information</h2>
            <ul>
              <li className="stat-row">
                <span>Height</span>
                <span>{(current.height / 10).toFixed(1)} m</span>
              </li>
              <li className="stat-row">
                <span>Weight</span>
                <span>{(current.weight / 10).toFixed(1)} kg</span>
              </li>
            </ul>
          </div>

          <div className="panel">
            <h2>Base Stats</h2>
            <ul>
              {current.stats.map((stat) => (
                <li key={stat.name} className="stat">
                  <span>{stat.name}</span>
                  <span>{stat.value}</span>
                  <progress max={255} value={stat.value} />
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h2>Weak To</h2>
            {matchups ? (
              <div className="types">
                {matchups.weak.length === 0 && <p>No weaknesses</p>}
                {matchups.weak.map((item) => (
                  <span
                    key={item.type}
                    className={`type type-${item.type.toLowerCase()}`}
                  >
                    {item.type}
                    {item.multiplier >= 4 ? " ×4" : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          <div className="panel">
            <h2>Strong Against</h2>
            {matchups ? (
              <div className="types">
                {matchups.strong.map((type) => (
                  <span
                    key={type}
                    className={`type type-${type.toLowerCase()}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel evo-panel">
        <h2>Evolution Chain</h2>

        {evolutions.length === 0 && <p>Loading...</p>}

        {evolutions.length === 1 && <p>This Pokémon does not evolve.</p>}

        {evolutions.length > 1 && (
          <div className="evo">
            {evolutions.map((stage, index) => (
              <div key={index} className="evo-group">
                {index > 0 && (
                  <span className="evo-arrow" aria-hidden="true">→</span>
                )}

                <div className="evo-stage">
                  {stage.map((item) => (
                    <Link
                      key={item.id}
                      to={`/pokemon/${item.id}`}
                      className={`evo-item ${item.id === pokemon.id ? "current" : ""}`}
                    >
                      <img src={item.image} alt={item.name} loading="lazy" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <nav className="pager">
        <button className="btn" onClick={goToPrevious} disabled={pokemonId <= 1}>
          ← Previous
        </button>

        <button className="btn" onClick={goToNext} disabled={pokemonId >= TOTAL_POKEMON}>
          Next →
        </button>
      </nav>
    </Shell>
  );
}

export default PokemonDetails;