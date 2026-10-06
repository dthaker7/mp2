interface LoaderProps {
  label?: string;
}

function Loader({ label = "Loading Pokémon..." }: LoaderProps) {
  return (
    <div className="status" role="status">
      <div className="pokeball" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export default Loader;
