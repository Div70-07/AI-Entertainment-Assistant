const { GoogleGenerativeAI } =
    require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const interpretWithGemini = async (query) => {

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const prompt = `
Extract entertainment preferences from the query.

Return ONLY valid JSON.

Required format:

{
  "genre":[],
  "creator":[],
  "mood":[]
}

Query:
"${query}"
`;

        const result =
            await model.generateContent(prompt);

        const response = await result.response.text();
        console.log("RAW GEMINI RESPONSE:");
        console.log(response);

        const cleaned =
            response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        return JSON.parse(cleaned);

    }

    catch (error) {

        console.error(
            "Gemini Error:",
            error.message
        );

        return {
            genre: [],
            creator: [],
            mood: []
        };

    }

};

const classifyVideoMetadata = async (
    title,
    description
) => {

    try {

        const model =
            genAI.getGenerativeModel({
                model: "gemini-2.0-flash"
            });

        const prompt = `
Analyze this YouTube video.

Return ONLY valid JSON.

Format:

{
  "genre":"",
  "mood":""
}

Video Title:
${title}

Video Description:
${description}

Possible genres:
Gaming
Technology
Comedy
Education
Music
Podcast
Entertainment
Sports

Possible moods:
Focus
Relax
Hype
Funny
Inspirational
Informative
`;

        const result =
            await model.generateContent(prompt);

        const response =
            await result.response.text();

        console.log(
            "RAW CLASSIFICATION RESPONSE:"
        );

        console.log(response);

        const cleaned =
            response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        return JSON.parse(cleaned);

    }

    catch (error) {

        console.log(
            "Classification Error:",
            error.message
        );

        return {
            genre: "Unknown",
            mood: "Unknown"
        };

    }

};

module.exports = {
    interpretWithGemini,
    classifyVideoMetadata
};