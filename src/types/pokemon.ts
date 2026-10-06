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
  cry: string | null;
  shinyImage: string | null;
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
export interface ChainLink {
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}

export interface SpeciesResponse {
  evolution_chain: { url: string };
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  genera: { genus: string; language: { name: string } }[];
  varieties: {
    is_default: boolean;
    pokemon: { name: string; url: string };
  }[];
}

export interface PokemonForm {
  id: number;
  name: string;
  image: string;
}

export interface SpeciesInfo {
  description: string;
  category: string;
  forms: PokemonForm[];
}

export interface EvolutionChainResponse {
  chain: ChainLink;
}

interface NamedType {
  name: string;
}

export interface TypeRelationsResponse {
  damage_relations: {
    double_damage_from: NamedType[];
    half_damage_from: NamedType[];
    no_damage_from: NamedType[];
    double_damage_to: NamedType[];
  };
}

export interface EvolutionStage {
  id: number;
  name: string;
  image: string;
}

export interface Matchups {
  weak: { type: string; multiplier: number }[];
  strong: string[];
}