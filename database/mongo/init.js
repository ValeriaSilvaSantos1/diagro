const banco = db.getSiblingDB("diagro");

const validador = {
  $jsonSchema: {
    bsonType: "object",
    required: ["diagnostico_id", "modelo_versao", "tipo_tarefa", "resultado", "criado_em"],
    properties: {
      diagnostico_id: {
        bsonType: ["int", "long"],
        description: "diagnosticos.id no PostgreSQL",
      },
      imagem_id: { bsonType: ["int", "long"] },
      modelo_versao: {
        bsonType: "string",
        description: "ex.: efficientnet_b0_v1_2026-11",
      },
      tipo_tarefa: { enum: ["classificacao", "deteccao", "segmentacao"] },
      resultado: {
        bsonType: "object",
        description: "formato livre, depende do tipo_tarefa",
      },
      tempo_inferencia_ms: { bsonType: ["double", "int", "long"] },
      criado_em: { bsonType: "date" },
    },
  },
};

const existe = banco.getCollectionNames().includes("inferencias");
if (existe) {
  banco.runCommand({ collMod: "inferencias", validator: validador, validationLevel: "strict" });
} else {
  banco.createCollection("inferencias", { validator: validador, validationLevel: "strict" });
}

// Um diagnóstico tem no máximo uma inferência: impede documentos duplicados.
banco.inferencias.createIndex({ diagnostico_id: 1 }, { unique: true, name: "ux_inferencias_diagnostico" });
// Comparar versões do modelo ao longo do tempo.
banco.inferencias.createIndex({ modelo_versao: 1, criado_em: -1 }, { name: "ix_inferencias_modelo_data" });

print(`Coleção 'inferencias' ${existe ? "atualizada" : "criada"} no banco 'diagro'.`);