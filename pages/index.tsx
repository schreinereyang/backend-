# Recréation du fichier ZIP avec les composants UI après reset

import zipfile
import os

# Définition du contenu des fichiers
components_code = {
    "components/ui/card.tsx": """
export function Card({ children, className }: any) {
  return <div className={`rounded-xl shadow bg-white/5 ${className}`}>{children}</div>;
}

export function CardContent({ children, className }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
""",
    "components/ui/button.tsx": """
export function Button({ children, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 transition ${className}`}
    >
      {children}
    </button>
  );
}
""",
    "components/ui/input.tsx": """
export function Input({ value, onChange, placeholder }: any) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
    />
  );
}
""",
    "tailwind.config.js": """
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
""",
    "postcss.config.js": """
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""
}

# Création du zip
zip_path = "/mnt/data/onlymoly-ui-components.zip"
with zipfile.ZipFile(zip_path, "w") as zipf:
    for filepath, content in components_code.items():
        full_path = f"/tmp/{os.path.basename(filepath)}"
        os.makedirs(os.path.dirname(f"/tmp/{filepath}"), exist_ok=True)
        with open(f"/tmp/{filepath}", "w", encoding="utf-8") as f:
            f.write(content.strip())
        zipf.write(f"/tmp/{filepath}", arcname=filepath)

zip_path
