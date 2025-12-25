import { Frown } from "lucide-react";
import { NavLink } from "react-router";

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center ">
      <Frown size={128} />
      <h1 className="text-5xl my-4">404</h1>
      <p>Aradığınız sayfa bulunamadı.</p>
      <p>
        Anasayfaya dönmek için{" "}
        <NavLink to="/" className="underline">
          buraya
        </NavLink>{" "}
        tıklayın.
      </p>
    </div>
  );
}
