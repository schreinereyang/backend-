import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log("🌱 Insertion des données fictives...");

  try {
    const { rows } = await pool.query(`
      INSERT INTO models (name, age, active)
      VALUES
        ('Elii', 21, true),
        ('Sofia', 23, false),
        ('Mila', 22, true)
      RETURNING id;
    `);

    const [elii, sofia, mila] = rows;

    await pool.query(`
      INSERT INTO subscribers (fan_id, model_id, active)
      VALUES
        ('fan123', ${elii.id}, true),
        ('fan456', ${elii.id}, true),
        ('fan789', ${mila.id}, true)
    `);

    await pool.query(`
      INSERT INTO messages (fan_id, sender, text, model_id)
      VALUES
        ('fan123', 'fan', 'Coucou Elii 😍', ${elii.id}),
        ('fan123', 'ia', 'Hey toi, t\'es là ?', ${elii.id}),
        ('fan456', 'fan', 'Tu es trop sexy...', ${elii.id}),
        ('fan789', 'fan', 'Dis-moi ce que tu portes', ${mila.id})
    `);

    await pool.query(`
      INSERT INTO sales (fan_id, model_id, media_id, price)
      VALUES
        ('fan123', ${elii.id}, 'vid123', 15.00),
        ('fan123', ${elii.id}, 'vid124', 20.00),
        ('fan456', ${elii.id}, 'vid128', 12.00),
        ('fan789', ${mila.id}, 'vid500', 25.00)
    `);

    console.log("✅ Données fictives insérées !");
  } catch (error) {
    console.error("❌ Erreur seed :", error);
  } finally {
    await pool.end();
  }
}

seed();
