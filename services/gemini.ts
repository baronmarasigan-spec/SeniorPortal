
import {GoogleGenAI} from "@google/genai";
import { Application, Complaint } from "../types";

// Always use a named parameter for the API key and obtain it exclusively from the environment.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const generateExecutiveSummary = async (applications: Application[], complaints: Complaint[]) => {
  if (!process.env.API_KEY) return "API Key missing. Cannot generate AI summary.";

  const dataContext = `
    Total Applications: ${applications.length}
    Pending Applications: ${applications.filter(a => a.status === 'Pending').length}
    Recent Complaints: ${complaints.length}
    Sample Complaint Subjects: ${complaints.map(c => c.subject).join(', ')}
  `;

  try {
    // Generate content using recommended property access for the generated text.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI assistant for a Senior Citizen Management System administrator. 
      Analyze the following data context and provide a brief, 2-sentence executive summary highlighting key areas requiring attention (e.g., bottlenecks, rising complaints).
      
      Data Context:
      ${dataContext}
      `,
    });
    // Access response.text as a property, not a function.
    return response.text || "Summary analysis completed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate summary at this time.";
  }
};

export const analyzeComplaint = async (complaintDetails: string) => {
    if (!process.env.API_KEY) return "API Key missing.";
    
    try {
        // Generate content using recommended property access for the generated text.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize this senior citizen complaint in 5 words or less for a quick status dashboard tag: "${complaintDetails}"`,
        });
        // Access response.text as a property, not a function.
        return response.text || "Complaint analyzed.";
    } catch (error) {
        console.error("Gemini Error", error);
        return "Analysis failed";
    }
}
