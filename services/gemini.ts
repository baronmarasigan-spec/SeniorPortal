import { GoogleGenAI } from "@google/genai";
import { Application, Complaint } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is available in your env
const ai = new GoogleGenAI({ apiKey });

export const generateExecutiveSummary = async (applications: Application[], complaints: Complaint[]) => {
  if (!apiKey) return "API Key missing. Cannot generate AI summary.";

  const dataContext = `
    Total Applications: ${applications.length}
    Pending Applications: ${applications.filter(a => a.status === 'Pending').length}
    Recent Complaints: ${complaints.length}
    Sample Complaint Subjects: ${complaints.map(c => c.subject).join(', ')}
  `;

  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI assistant for a Senior Citizen Management System administrator. 
      Analyze the following data context and provide a brief, 2-sentence executive summary highlighting key areas requiring attention (e.g., bottlenecks, rising complaints).
      
      Data Context:
      ${dataContext}
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate summary at this time.";
  }
};

export const analyzeComplaint = async (complaintDetails: string) => {
    if (!apiKey) return "API Key missing.";
    
    try {
        const model = ai.models;
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize this senior citizen complaint in 5 words or less for a quick status dashboard tag: "${complaintDetails}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error", error);
        return "Analysis failed";
    }
}
