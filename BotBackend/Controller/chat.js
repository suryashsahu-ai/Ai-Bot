
const axios = require("axios");

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const MODEL = "openai/gpt-oss-20b";

const MARKET_GUARD_PROMPT = `
You are a message classifier.

Classify the user's latest message into exactly one category:

MARKET:
Stocks, NSE, BSE, Nifty, Sensex, trading,
technical analysis, fundamental analysis, options,
futures, commodities, gold, silver, forex,
cryptocurrency, IPO, mutual funds and financial news.

GENERAL:
Greetings, coding, programming, jokes, personal
conversations, general knowledge and everything
unrelated to financial markets.

Return ONLY valid JSON:
{"category":"MARKET"}
or
{"category":"GENERAL"}
`;

const MARKET_SYSTEM_PROMPT = `
You are a professional Market AI assistant.
Answer questions related to stocks, trading,
Nifty, Sensex, NSE, BSE, investments and financial markets.
Give clear, useful and responsible financial information.
Never invent live market prices.
`;

const GENERAL_SYSTEM_PROMPT = `
You are a helpful General AI assistant.
Answer all normal questions including coding,
programming, education, greetings and general knowledge.
Give clear and friendly answers.
`;

exports.chat = async (req, res) => {
    const { message, messages } = req.body;

    const conversation = Array.isArray(messages) && messages.length
        ? messages
        : message
        ? [{ role: "user", content: message }]
        : [];

    if (!conversation.length) {
        return res.status(400).json({
            message: "No message provided"
        });
    }

    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({
            message: "GROQ_API_KEY is missing"
        });
    }

    try {
        // Get latest user message
        const latestMessage = [...conversation]
            .reverse()
            .find(msg => msg.role === "user");

        if (!latestMessage || typeof latestMessage.content !== "string") {
            return res.status(400).json({
                message: "Invalid user message"
            });
        }

        // STEP 1: Classify message
        const classification = await axios.post(
            GROQ_URL,
            {
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: MARKET_GUARD_PROMPT
                    },
                    {
                        role: "user",
                        content: latestMessage.content
                    }
                ],
                temperature: 0
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const rawCategory =
            classification.data.choices[0].message.content;

        let category;

        try {
            const parsed = JSON.parse(rawCategory);
            category = parsed.category;
        } catch {
            throw new Error("Invalid classification JSON");
        }

        if (!["MARKET", "GENERAL"].includes(category)) {
            throw new Error("Invalid message category");
        }

        // STEP 2: Select appropriate AI prompt
        const selectedPrompt =
            category === "MARKET"
                ? MARKET_SYSTEM_PROMPT
                : GENERAL_SYSTEM_PROMPT;

        // STEP 3: Generate actual response
        const validHistory = conversation.filter(
            msg =>
                ["user", "assistant"].includes(msg.role) &&
                typeof msg.content === "string"
        );

        const aiResponse = await axios.post(
            GROQ_URL,
            {
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: selectedPrompt
                    },
                    ...validHistory
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply =
            aiResponse.data.choices[0].message.content;

        return res.json({
            category,
            reply
        });

    } catch (error) {
        console.error(
            "Groq Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "AI service is temporarily unavailable"
        });
    }
};

