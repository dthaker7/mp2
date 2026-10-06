export interface PokemonListItem {
  id: number;
  name: string;
  region: string;
  types: string[];
  image: string;
}

export interface Pokemon {
  id: number;
  name: string;
  region: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: {
    name: string;
    value: number;
  }[];
  image: string;
}

export interface NamedResourceListResponse {
  count: number;
  results: {
    name: string;
    url: string;
  }[];
}

export interface GenerationResponse {
  id: number;
  name: string;
  main_region: {
    name: string;
  };
  pokemon_species: {
    name: string;
    url: string;
  }[];
}

export interface TypeResponse {
  id: number;
  name: string;
  pokemon: {
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}