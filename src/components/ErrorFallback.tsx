
import React, { useState } from "react";

const ErrorFallback: React.FC<any> = ({ error, resetErrorBoundary }) => {
  const [lang, setLang] = useState("fr");
  return (
    <div className="row">
      <div
        className="col-md-5 h-screen flex flex-col justify-center items-center"
        style={{ backgroundColor: "rgb(3, 115, 117)" }}
      ></div>
      <div className="col-md-7 h-screen flex flex-col items-center justify-center">
        <select onChange={(e) => setLang(e.target.value)}>
          <option value="en">En</option>
          <option value="fr">Fr</option>
        </select>
        {lang === "fr" ? (
          <div className="p-4">
            <h1 className="font-bold text-3xl mb-2">Oups, désolé !</h1>
            <p>
              Quelque chose a mal tourné, mais ne vous inquiétez pas, Danapay
              est en charge. Envoyez-nous cette erreur.
            </p>
            <small className="text-red-600">{error.message}</small>
            <br />
            <button
              onClick={() => resetErrorBoundary()}
              className="mt-3 bg-gray-200 p-2 shadow"
            >
              <small>Cliquez ici pour vous déconnecter et réessayer.</small>
            </button>

            <small>Danapay.</small>
          </div>
        ) : (
          <div className="p-4">
            <h1 className="font-bold text-3xl mb-2">Oops Sorry!</h1>
            <p>
              Something went wrong, but dont worry Danapay is in charge. Send us
              this error.
            </p>
            <small className="text-red-600">{error.message}</small>
            <br />
            <button
              onClick={() => resetErrorBoundary()}
              className="mt-3 bg-gray-200 p-3 shadow"
            >
              <small>Click here to log out and try again.</small>
            </button>
            <br />
            <br />
            <small>Danapay</small>
          </div>
        )}
      </div>

    </div>
  );
};
export default ErrorFallback;
