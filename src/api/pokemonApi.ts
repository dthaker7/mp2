import axios from "axios";
import type {
  GenerationResponse,
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

export async function getPokemonById(id: number): Promise<Pokemon> {
  const response = await axios.get(`${API_URL}/pokemon/${id}`);

  const data = response.data;

  const regionMap = await getRegionMap();

  return {
    id: data.id,
    name: formatName(data.name),
    region: regionMap.get(data.id) ?? "Unknown",

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
  };
}