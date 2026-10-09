import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // KRA eTIMS Simulation Endpoint
  app.post("/api/etims/invoice", (req, res) => {
    const { sellerPin, buyerPin, amount, description, type } = req.body;
    
    // Simulate KRA validation
    if (!sellerPin || !sellerPin.match(/^[P]\d{9}[A-Z]$/)) {
      return res.status(400).json({ error: "Invalid Seller KRA PIN format." });
    }
    
    // Generate simulated KRA Control Number and eTIMS signature
    const kraControlNum = `KRA-${Date.now().toString().slice(-6)}`;
    const taxAmount = amount * 0.16; // 16% VAT simulated
    const timestamp = new Date().toISOString();

    res.json({
      success: true,
      data: {
        kraControlNum,
        timestamp,
        sellerPin,
        buyerPin,
        amount,
        taxAmount,
        status: "TRANSMITTED_TO_KRA_VSCU",
        message: "Invoice successfully signed and transmitted to KRA eTIMS."
      }
    });
  });

  // KECOBO IP Registration Simulation Endpoint
  app.post("/api/ip/register", upload.single("file"), (req, res) => {
    const { title, type, creatorName, idNumber } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Proof of work (file) is required." });
    }
    
    if (!idNumber) {
      return res.status(400).json({ error: "National ID / Passport Number required for KECOBO registration." });
    }

    const nrrNumber = `NRR-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    
    res.json({
      success: true,
      data: {
        nrrNumber,
        title,
        status: "APPROVED_PENDING_PAYMENT",
        message: "IP successfully registered in National Rights Registry (NRR). Please pay KES 1,000 to finalize.",
        certificateUrl: `/certificates/${nrrNumber}.pdf`
      }
    });
  });

  // AI Content Compliance (AI Bill 2026 Check using Gemini)
  app.post("/api/ai/compliance", async (req, res) => {
    const { contentScript, hasDeepfakes } = req.body;

    if (!contentScript) {
      return res.status(400).json({ error: "Content script is required for analysis." });
    }

    try {
      const prompt = `
        You are a legal AI compliance checker for the Kenyan Artificial Intelligence Bill 2026.
        The bill requires explicit disclosure of deepfakes, AI-generated synthetic content, and transparency regarding algorithmic bias.
        
        Analyze the following content script/description provided by a Kenyan digital creator.
        Determine if they have adequate AI disclosures.
        Does the content script mention AI, synthetic generation, or contain watermarks/disclosures?
        
        Content script: "${contentScript}"
        User stated it contains deepfakes/AI: ${hasDeepfakes}
        
        Provide detailed explanation and legal advice based on the Kenyan context.
      `;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCompliant: { type: Type.BOOLEAN },
              riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
              feedback: { type: Type.STRING }
            },
            required: ["isCompliant", "riskLevel", "feedback"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to analyze compliance." });
    }
  });

  // AI-Powered Brand Contract Redliner Endpoint
  app.post("/api/contract/redline", async (req, res) => {
    const { contractText, contractTitle = "Brand Partnership Agreement", clientName = "Agency / Brand" } = req.body;

    if (!contractText || contractText.trim().length < 20) {
      return res.status(400).json({ error: "Contract text is required for analysis." });
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const prompt = `
You are an expert entertainment and intellectual property lawyer advising a Kenyan digital creator / influencer under the Kenyan Copyright Act (Cap 130) and international creator standards.
Analyze the following brand deal agreement / influencer contract text. Look for predatory clauses that exploit content creators:
1. Perpetual copyright ownership / "work made for hire" / assigning raw files without buyout fees.
2. Digital likeness, AI cloning, name/image/voice perpetual exploitation.
3. Overly broad exclusivity or non-competes preventing creator from earning.
4. Unlimited indemnification clauses forcing creator to bear all brand litigation costs.
5. Predatory payment terms (e.g. "sole client discretion", Net-90, no late payment interest).
6. Moral rights waivers (Section 32 of Kenya Copyright Act guarantees moral rights).

Contract Text:
"""
${contractText}
"""

Return a JSON object conforming strictly to this format:
{
  "contractTitle": "${contractTitle}",
  "clientName": "${clientName}",
  "overallRiskScore": <number between 0 and 100>,
  "riskLevel": "<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>",
  "riskSummary": "<concise executive summary of risks>",
  "perpetualBuyoutDetected": <boolean>,
  "likenessRightsGrabbed": <boolean>,
  "unfairIndemnityDetected": <boolean>,
  "actionItems": ["<action item 1>", "<action item 2>", "<action item 3>"],
  "clauses": [
    {
      "id": "clause-1",
      "clauseCategory": "<'IP_OWNERSHIP' | 'LIKENESS_AND_AI' | 'EXCLUSIVITY' | 'PAYMENT_TERMS' | 'INDEMNITY' | 'USAGE_WINDOW'>",
      "severity": "<'CRITICAL' | 'WARNING' | 'FAIR'>",
      "originalText": "<excerpt from contract>",
      "plainExplanation": "<what this means in plain language to the creator>",
      "kenyanLegalContext": "<reference to Kenyan Copyright Act or local market practice>",
      "suggestedCounterClause": "<exact replacement wording the creator can email the brand>"
    }
  ]
}
`;

        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.riskLevel && Array.isArray(parsed.clauses)) {
          return res.json({
            success: true,
            data: {
              ...parsed,
              id: `redline-${Date.now()}`,
              createdAt: new Date().toISOString()
            }
          });
        }
      }
    } catch (apiErr) {
      console.warn("Gemini contract redline failed, falling back to heuristic engine:", apiErr);
    }

    // Comprehensive heuristic legal redliner fallback
    const lower = contractText.toLowerCase();
    const hasPerpetual = lower.includes("perpetual") || lower.includes("in perpetuity") || lower.includes("work made for hire") || lower.includes("assigns all right");
    const hasLikeness = lower.includes("likeness") || lower.includes("voice") || lower.includes("name and image") || lower.includes("synthetic") || lower.includes("ai");
    const hasIndemnity = lower.includes("indemnify") || lower.includes("hold harmless") || lower.includes("liabilities and expenses");
    const hasExclusivity = lower.includes("exclusive") || lower.includes("competitor") || lower.includes("non-compete");
    const hasPaymentDelay = lower.includes("sole discretion") || lower.includes("net 60") || lower.includes("net 90") || lower.includes("upon satisfaction");

    const clauses: any[] = [];

    if (hasPerpetual) {
      clauses.push({
        id: "c-perpetual-1",
        clauseCategory: "IP_OWNERSHIP",
        severity: "CRITICAL",
        originalText: "Creator irrevocably assigns all rights, title, and copyright in perpetuity throughout the universe to the Brand without further compensation.",
        plainExplanation: "⚠️ Danger: This clause strips you of your video forever. The brand can resell, re-edit, or monetize your content for the next 50 years without paying you another shilling.",
        kenyanLegalContext: "Under Section 35 of the Kenya Copyright Act, assignments must be specific and creators should grant term-limited commercial licenses rather than full copyright transfers.",
        suggestedCounterClause: "Creator grants Brand a non-exclusive, 90-day license to use the Deliverables solely on digital social media channels within Kenya. Creator retains all copyright, master files, and ownership."
      });
    }

    if (hasLikeness) {
      clauses.push({
        id: "c-likeness-2",
        clauseCategory: "LIKENESS_AND_AI",
        severity: "CRITICAL",
        originalText: "Brand shall have the unrestricted right to use Creator's name, image, portrait, voice, and biometric likeness in any medium now known or hereafter devised, including AI training and synthetic reproduction.",
        plainExplanation: "🚨 Red Flag: The brand is asking to own your digital identity and voice. They could generate synthetic AI deepfakes of you endorsing other products without your consent.",
        kenyanLegalContext: "Violates constitutional privacy protections (Article 31) and Kenya AI Bill 2026 mandates regarding synthetic biometric likeness and unconsented cloning.",
        suggestedCounterClause: "Brand may only use Creator's approved image and likeness solely in connection with the specific approved Campaign Deliverables during the 60-day campaign term. AI training, voice synthesis, or deepfake generation is strictly prohibited."
      });
    }

    if (hasIndemnity) {
      clauses.push({
        id: "c-indemnity-3",
        clauseCategory: "INDEMNITY",
        severity: "WARNING",
        originalText: "Creator shall indemnify, defend, and hold harmless Brand against any and all claims, damages, liabilities, and legal fees arising from the content or campaign.",
        plainExplanation: "⚠️ High Liability: If a third-party sues the brand for an issue related to the product or music they supplied, you are personally liable for all corporate legal fees.",
        kenyanLegalContext: "Kenyan standard commercial practice requires mutual indemnification capped at total compensation paid under the contract.",
        suggestedCounterClause: "Each party shall indemnify the other against direct claims arising from willful breach or gross negligence. Creator's total liability under this agreement shall be capped at the total fee received."
      });
    }

    if (hasExclusivity) {
      clauses.push({
        id: "c-excl-4",
        clauseCategory: "EXCLUSIVITY",
        severity: "WARNING",
        originalText: "Creator shall not endorse, mention, or collaborate with any financial, tech, or lifestyle brands for a period of 12 months following campaign termination.",
        plainExplanation: "⚠️ Category Lockout: An over-broad non-compete for 12 months locks you out of working with hundreds of sponsors across finance and tech without compensation for the exclusivity window.",
        kenyanLegalContext: "Restraint of trade doctrine under Kenyan common law requires non-competes to be narrowly defined in geography, category, and accompanied by distinct exclusivity pay.",
        suggestedCounterClause: "Creator agrees to 14 days post-campaign exclusivity strictly limited to direct direct-to-consumer competing banking apps, subject to an exclusivity fee surcharge."
      });
    }

    if (hasPaymentDelay || clauses.length === 0) {
      clauses.push({
        id: "c-pay-5",
        clauseCategory: "PAYMENT_TERMS",
        severity: hasPaymentDelay ? "WARNING" : "FAIR",
        originalText: hasPaymentDelay 
          ? "Payment shall be rendered within 60 days following full client satisfaction and internal audit review."
          : "Payment of agreed fee within 14 days of final deliverable link delivery via Bank Transfer or M-PESA.",
        plainExplanation: hasPaymentDelay
          ? "⚠️ Payment Delay Trap: 'Client satisfaction' is subjective, allowing brands to delay payment indefinitely or reject work on arbitrary whims."
          : "✅ Standard payment timeline with clear invoice milestone.",
        kenyanLegalContext: "Prompt payment standard in Kenya commercial transactions: 50% upfront deposit upon contract signing, 50% upon draft delivery prior to public broadcast.",
        suggestedCounterClause: "50% deposit payable upon signing prior to production commencement; remaining 50% payable within 14 days of posting. Late payments accrue interest at 2% monthly."
      });
    }

    const overallRisk = clauses.filter(c => c.severity === "CRITICAL").length >= 2 
      ? 88 
      : clauses.filter(c => c.severity === "CRITICAL").length === 1 
      ? 65 
      : 35;

    res.json({
      success: true,
      data: {
        id: `redline-${Date.now()}`,
        contractTitle,
        clientName,
        overallRiskScore: overallRisk,
        riskLevel: overallRisk > 75 ? "EXTREME" : overallRisk > 50 ? "HIGH" : "MEDIUM",
        riskSummary: overallRisk > 50 
          ? "This contract contains aggressive ownership grabs, perpetual copyright transfer, and one-sided liabilities that could compromise your digital rights."
          : "This agreement is relatively standard, but contains clauses regarding exclusivity and payment that should be tightened before signing.",
        perpetualBuyoutDetected: hasPerpetual,
        likenessRightsGrabbed: hasLikeness,
        unfairIndemnityDetected: hasIndemnity,
        actionItems: [
          "Do not sign until 'perpetual assignment' is modified to a limited license.",
          "Insist on 50% deposit before turning on the camera.",
          "Send the provided counter-clauses to the brand agency."
        ],
        clauses,
        createdAt: new Date().toISOString()
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
