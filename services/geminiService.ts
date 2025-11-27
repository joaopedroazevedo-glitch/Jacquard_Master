import { GoogleGenAI } from "@google/genai";
import { Loom, Article, LoomStatus } from '../types';

// Ensure API key is available
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const analyzeProduction = async (looms: Loom[], articles: Article[]): Promise<string> => {
  if (!apiKey) {
    return "A chave API do Gemini não foi configurada. Por favor configure process.env.API_KEY.";
  }

  try {
    // Prepare a summarized context for the AI
    const runningCount = looms.filter(l => l.status === LoomStatus.RUNNING).length;
    const stoppedCount = looms.filter(l => l.status === LoomStatus.STOPPED).length;
    const maintenanceCount = looms.filter(l => l.status === LoomStatus.MAINTENANCE).length;

    const loomData = looms.map(l => ({
      id: l.id,
      status: l.status,
      article: articles.find(a => a.id === l.articleId)?.name || 'N/A',
      finishTime: l.expectedEndTime,
      client: l.clientName
    }));

    const prompt = `
      Atue como um gerente de produção sênior de uma fábrica têxtil com teares Jacquard.
      Analise os dados atuais da produção abaixo e forneça um relatório curto e direto (máximo 4 parágrafos) em Português.
      
      Pontos para cobrir:
      1. Eficiência geral (Teares rodando: ${runningCount}/20).
      2. Alertas críticos (Teares parados ou em manutenção).
      3. Previsões de término próximas (quais teares vão acabar logo e precisam de atenção para troca).
      4. Sugestão rápida de ação.

      Dados dos Teares (JSON simplificado):
      ${JSON.stringify(loomData)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise no momento.";

  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ocorreu um erro ao tentar conectar com a IA da Google. Verifique a consola.";
  }
};
