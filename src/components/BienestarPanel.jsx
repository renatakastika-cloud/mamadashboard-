import Header from "./Header";
import DiarioLibre from "./DiarioLibre";

export default function BienestarPanel() {
  return (
    <div>
      <Header
        title="💜 Mi Bienestar"
        subtitle="Tu espacio íntimo para escribir, sin filtro y sin juicio"
      />
      <DiarioLibre />
    </div>
  );
}
