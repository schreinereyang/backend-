# Recréation du fichier seed.ts après reset
seed_ts_content = """
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log("🌱 Insertion de données fictives dans OnlyMoly...");

  try {
    const result = await pool.query(\`
      INSERT INTO models (name, age, active)
      VALUES
        ('Elii', 21, true),
        ('Sofia', 23, true),
        ('Mila', 22, false)
      RETURNING id
    \`);

    const [elii, sofia, mila] = result.rows;

    await pool.query(\`
      INSERT INTO subscribers (fan_id, model_id, active)
      VALUES
        ('fan001', \${elii.id}, true),
        ('fan002', \${sofia.id}, true),
        ('fan003', \${sofia.id}, true)
    \`);

    await pool.query(\`
      INSERT INTO sales (model_id, fan_id, media_id, price)
      VALUES
        (\${elii.id}, 'fan001', 'media001', 19.99),
        (\${elii.id}, 'fan001', 'media002', 14.99),
        (\${sofia.id}, 'fan002', 'media010', 29.99)
    \`);

    await pool.query(\`
      INSERT INTO messages (fan_id, sender, text, model_id)
      VALUES
        ('fan001', 'fan', 'Tu me rends fou Elii 😍', \${elii.id}),
        ('fan001', 'ia', 'Haha je suis là pour ça bébé 😈', \${elii.id}),
        ('fan002', 'fan', 'Sofia tu m’as manqué aujourd’hui…', \${sofia.id}),
        ('fan002', 'ia', 'Je pensais justement à toi 🥺', \${sofia.id})
    \`);

    console.log("✅ Données fictives injectées avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l’injection :", err);
  } finally {
    await pool.end();
  }
}

seed();
"""

# Save the file
seed_path = "/mnt/data/seed.ts"
with open(seed_path, "w") as f:
    f.write(seed_ts_content)

seed_path
