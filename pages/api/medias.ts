import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), "utils", "medias.json");

  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileData);
    res.status(200).json(data);
  } catch (err) {
    console.error("Erreur lecture medias.json:", err);
    res.status(500).json({ medias: [] });
  }
}
