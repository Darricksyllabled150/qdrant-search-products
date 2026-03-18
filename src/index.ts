import "dotenv/config";
import express from "express";
import { router } from "./routes";
import { garantirCollection } from "./qdrant.service";

const PORT = parseInt(process.env.PORT ?? "3000");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/api", router);

async function main() {
  try {
    await garantirCollection();

    app.listen(PORT, () => {
      console.log(`[Sistema] Serviço ativo em http://localhost:${PORT}`);
      console.log(`[Sistema] Endpoints disponíveis:`);
      console.log(`  GET  /api/health         → status da collection`);
      console.log(`  POST /api/items          → indexar lista de itens`);
      console.log(`  POST /api/busca          → busca semântica + filtros`);
    });
  } catch (err) {
    console.error("[Sistema] Erro fatal:", err);
    process.exit(1);
  }
}

main();
