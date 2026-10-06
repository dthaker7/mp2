import axios from "axios";
import type {
  EvolutionChainResponse,
  EvolutionStage,
  GenerationResponse,
  Matchups,
  SpeciesInfo,
  SpeciesResponse,
  TypeRelationsResponse,
  NamedResourceListResponse,
  Pokemon,
  PokemonListItem,
  TypeResponse,
} from "../types/pokemon";

const API_URL = "https://pokeapi.co/api/v2";

const TYPE_NAMES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const TOTAL_GENERATIONS = 9;

let cachedRegionMap: Map<number, string> | null = null;
let cachedTypeMap: Map<number, string[]> | null = null;
let cachedPokemonList: PokemonListItem[] | null = null;

let regionMapPromise: Promise<Map<number, string>> | null = null;
let typeMapPromise: Promise<Map<number, string[]>> | null = null;

function getPokemonId(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function formatName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getImageUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

async function getRegionMap(): Promise<Map<number, string>> {
  if (cachedRegionMap) {
    return cachedRegionMap;
  }

  if (regionMapPromise) {
    return regionMapPromise;
  }

  regionMapPromise = Promise.all(
    Array.from({ length: TOTAL_GENERATIONS }, (_, index) =>
      axios.get<GenerationResponse>(
        `${API_URL}/generation/${index + 1}`
      )
    )
  ).then((responses) => {
    const regionMap = new Map<number, string>();

    responses.forEach((response) => {
      const generation = response.data;
      const region = formatName(generation.main_region.name);

      generation.pokemon_species.forEach((species) => {
        const id = getPokemonId(species.url);
        regionMap.set(id, region);
      });
    });

    cachedRegionMap = regionMap;
    return regionMap;
  });

  return regionMapPromise;
}

async function getTypeMap(): Promise<Map<number, string[]>> {
  if (cachedTypeMap) {
    return cachedTypeMap;
  }

  if (typeMapPromise) {
    return typeMapPromise;
  }

  typeMapPromise = Promise.all(
    TYPE_NAMES.map((typeName) =>
      axios.get<TypeResponse>(`${API_URL}/type/${typeName}`)
    )
  ).then((responses) => {
    const typeMap = new Map<number, string[]>();

    responses.forEach((response) => {
      const typeName = formatName(response.data.name);

      response.data.pokemon.forEach((entry) => {
        const id = getPokemonId(entry.pokemon.url);

        if (!typeMap.has(id)) {
          typeMap.set(id, []);
        }

        typeMap.get(id)!.push(typeName);
      });
    });

    cachedTypeMap = typeMap;
    return typeMap;
  });

  return typeMapPromise;
}

export async function getPokemonList(): Promise<PokemonListItem[]> {
  if (cachedPokemonList) {
    return cachedPokemonList;
  }

  const [speciesResponse, regionMap, typeMap] = await Promise.all([
    axios.get<NamedResourceListResponse>(
      `${API_URL}/pokemon-species?limit=2000&offset=0`
    ),
    getRegionMap(),
    getTypeMap(),
  ]);

  const pokemonList = speciesResponse.data.results.map((species) => {
    const id = getPokemonId(species.url);

    return {
      id,
      name: formatName(species.name),
      region: regionMap.get(id) ?? "Unknown",
      types: typeMap.get(id) ?? [],
      image: getImageUrl(id),
    };
  });

  pokemonList.sort((a, b) => a.id - b.id);

  cachedPokemonList = pokemonList;

  return pokemonList;
}

// regionId lets alternate forms (Mega, Alolan...) reuse the base species region
export async function getPokemonById(
  id: number,
  regionId = id
): Promise<Pokemon> {
  const response = await axios.get(`${API_URL}/pokemon/${id}`);

  const data = response.data;

  const regionMap = await getRegionMap();

  return {
    id: data.id,
    name: formatName(data.name),
    region: regionMap.get(regionId) ?? "Unknown",

    height: data.height,
    weight: data.weight,

    types: data.types.map(
      (type: { type: { name: string } }) =>
        formatName(type.type.name)
    ),

    abilities: data.abilities.map(
      (ability: { ability: { name: string } }) =>
        formatName(ability.ability.name)
    ),

    stats: data.stats.map(
      (stat: {
        stat: { name: string };
        base_stat: number;
      }) => ({
        name: formatName(stat.stat.name),
        value: stat.base_stat,
      })
    ),

    image:
      data.sprites.other?.["official-artwork"]?.front_default ??
      getImageUrl(data.id),

    cry: data.cries?.latest ?? data.cries?.legacy ?? null,

    shinyImage:
      data.sprites.other?.["official-artwork"]?.front_shiny ?? null,
  };
}
const speciesCache = new Map<number, Promise<SpeciesResponse>>();

function getSpecies(id: number): Promise<SpeciesResponse> {
  let request = speciesCache.get(id);

  if (!request) {
    request = axios
      .get<SpeciesResponse>(`${API_URL}/pokemon-species/${id}`)
      .then((response) => response.data);
    request.catch(() => speciesCache.delete(id));
    speciesCache.set(id, request);
  }

  return request;
}

export async function getSpeciesInfo(id: number): Promise<SpeciesInfo> {
  const species = await getSpecies(id);

  const entries = species.flavor_text_entries.filter(
    (entry) => entry.language.name === "en"
  );
  const latest = entries[entries.length - 1];

  const genus = species.genera.find((item) => item.language.name === "en");

  const forms = species.varieties
    .filter(
      (variety) =>
        !variety.is_default &&
        /-(mega|alola|galar|hisui|paldea|gmax|primal)/.test(variety.pokemon.name)
    )
    .map((variety) => {
      const formId = getPokemonId(variety.pokemon.url);
      return {
        id: formId,
        name: formatName(variety.pokemon.name),
        image: getImageUrl(formId),
      };
    });

  return {
    description: latest
      ? latest.flavor_text.replace(/[\n\f\u00ad]/g, " ")
      : "No description available.",
    category: genus?.genus ?? "",
    forms,
  };
}

export async function getEvolutionChain(id: number): Promise<EvolutionStage[][]> {
  const species = await getSpecies(id);
  const chain = await axios.get<EvolutionChainResponse>(
    species.evolution_chain.url
  );

  const stages: EvolutionStage[][] = [];
  let level = [chain.data.chain];

  while (level.length > 0) {
    stages.push(
      level.map((link) => {
        const speciesId = getPokemonId(link.species.url);
        return {
          id: speciesId,
          name: formatName(link.species.name),
          image: getImageUrl(speciesId),
        };
      })
    );
    level = level.flatMap((link) => link.evolves_to);
  }

  return stages;
}

const typeRelationsCache = new Map<string, TypeRelationsResponse>();

async function getTypeRelations(name: string): Promise<TypeRelationsResponse> {
  const cached = typeRelationsCache.get(name);
  if (cached) return cached;

  const response = await axios.get<TypeRelationsResponse>(
    `${API_URL}/type/${name}`
  );
  typeRelationsCache.set(name, response.data);
  return response.data;
}

export async function getMatchups(types: string[]): Promise<Matchups> {
  const relations = await Promise.all(
    types.map((type) => getTypeRelations(type.toLowerCase()))
  );

  const multipliers = new Map<string, number>();
  const apply = (list: { name: string }[], factor: number) =>
    list.forEach((item) =>
      multipliers.set(item.name, (multipliers.get(item.name) ?? 1) * factor)
    );

  relations.forEach((relation) => {
    apply(relation.damage_relations.double_damage_from, 2);
    apply(relation.damage_relations.half_damage_from, 0.5);
    apply(relation.damage_relations.no_damage_from, 0);
  });

  const weak = Array.from(multipliers.entries())
    .filter(([, multiplier]) => multiplier > 1)
    .map(([name, multiplier]) => ({ type: formatName(name), multiplier }));

  const strong = Array.from(
    new Set(
      relations.flatMap((relation) =>
        relation.damage_relations.double_damage_to.map((item) =>
          formatName(item.name)
        )
      )
    )
  );

  return { weak, strong };
}