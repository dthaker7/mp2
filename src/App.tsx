import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PokemonDetails from "./pages/PokemonDetails";
import SoundToggle from "./components/SoundToggle";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SoundToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;