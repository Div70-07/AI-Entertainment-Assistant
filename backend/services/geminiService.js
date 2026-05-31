const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const createCanonicalPreferences = (intent = "") => ({
    intent,
    contentType: [],
    genre: [],
    creator: [],
    mood: [],
    emotion: [],
    goal: [],
    context: [],
    company: [],
    activity: [],
    energy: []
});

const unique = (values = []) => [...new Set(values.filter(Boolean))];

const normalizeCanonicalSchema = (parsed = {}, intent = "") => {
    const normalized = createCanonicalPreferences(parsed.intent || intent || "");

    normalized.contentType = unique(parsed.contentType || []);
    normalized.genre = unique(parsed.genre || []);
    normalized.creator = unique(parsed.creator || []);
    normalized.mood = unique(parsed.mood || []);
    normalized.emotion = unique(parsed.emotion || parsed.emotionalState || []);
    normalized.goal = unique(parsed.goal || parsed.desiredOutcome || []);
    normalized.context = unique(parsed.context || parsed.situation || []);
    normalized.company = unique(parsed.company || parsed.audience || []);
    normalized.activity = unique(parsed.activity || []);
    normalized.energy = unique(parsed.energy || []);

    return normalized;
};

const getFallbackPreferences = (query, profile = null) => {
    const rawQuery = (query || "").trim();
    const q = rawQuery.toLowerCase();
    const preferences = createCanonicalPreferences(rawQuery);

    const addIfExplicit = (condition, key, value) => {
        if (condition) {
            preferences[key].push(value);
        }
    };

    // Minimal explicit queries should stay minimal.
    if (/^(comedy)$/.test(q)) {
        preferences.genre.push("Comedy");
        return preferences;
    }
    if (/^(funny)$/.test(q)) {
        preferences.mood.push("funny");
        return preferences;
    }
    if (/^(music)$/.test(q)) {
        preferences.contentType.push("music");
        return preferences;
    }
    if (/^(sci-fi|scifi)$/.test(q)) {
        preferences.genre.push("Sci-Fi");
        return preferences;
    }

    addIfExplicit(/\bmusic\b|\bsong\b|\bsongs\b|\bplaylist\b/.test(q), "contentType", "music");
    addIfExplicit(/\bvideo\b|\bvideos\b|\bmovie\b|\bmovies\b|\bshow\b|\bshows\b|\bwatch\b/.test(q), "contentType", "video");

    addIfExplicit(/\bsci-fi\b|\bscifi\b/.test(q), "genre", "Sci-Fi");
    addIfExplicit(/\baction\b/.test(q), "genre", "Action");
    addIfExplicit(/\bgaming\b|\bgame\b/.test(q), "genre", "Gaming");
    addIfExplicit(/\bcoding\b|\bcode\b|\bprogramming\b|\bdeveloper\b|\btech\b|\btechnology\b/.test(q), "genre", "Technology");
    addIfExplicit(/\bcomedy\b|\bstandup\b|\bstand-up\b/.test(q), "genre", "Comedy");
    addIfExplicit(/\beducation\b|\btutorial\b|\blearn\b|\bstudy\b/.test(q), "genre", "Education");
    addIfExplicit(/\bmusic\b|\bsong\b|\bsongs\b|\bplaylist\b/.test(q), "genre", "Music");
    addIfExplicit(/\bpodcast\b/.test(q), "genre", "Podcast");
    addIfExplicit(/\bsports\b|\bfootball\b|\bsoccer\b/.test(q), "genre", "Sports");
    addIfExplicit(/\bthriller\b|\bmystery\b|\bhorror\b/.test(q), "genre", "Thriller");
    addIfExplicit(/\bdocumentary\b/.test(q), "genre", "Documentary");

    addIfExplicit(/\bfunny\b|\blaugh\b|\bjoke\b/.test(q), "mood", "funny");
    addIfExplicit(/\bfocus\b|\bdeep work\b/.test(q), "mood", "focus");
    addIfExplicit(/\bchill\b|\brelax\b|\brelaxing\b|\bcomfort\b/.test(q), "mood", "chill");
    addIfExplicit(/\bhype\b|\benergetic\b/.test(q), "mood", "hype");
    addIfExplicit(/\btense\b|\bscary\b/.test(q), "mood", "tense");

    const hasExplicitContextEvidence =
        /\bwith family\b|\bwith friends\b|\bwith my girlfriend\b|\bwith my boyfriend\b|\bwith my partner\b/.test(q) ||
        /\bfamily\b|\bfriends\b|\bgirlfriend\b|\bboyfriend\b|\bpartner\b/.test(q) ||
        /\bgym\b|\bworkout\b|\blate night\b|\bbreakup\b|\bmovie night\b|\bhome\b|\boffice\b|\bcommute\b|\bparty\b/.test(q);

    if (hasExplicitContextEvidence) {
        addIfExplicit(/\bbreakup\b|\bheartbreak\b|\bsad\b/.test(q), "emotion", "heartbreak");
        addIfExplicit(/\bstressed\b|\bstressful\b|\btired\b/.test(q), "emotion", "stressed");

        addIfExplicit(/\bhealing\b|\bmove on\b|\bget over it\b/.test(q), "goal", "healing");
        addIfExplicit(/\brelatable\b|\bvalidation\b/.test(q), "goal", "relatability");
        addIfExplicit(/\bgym\b|\bworkout\b|\bmotivation\b|\bhype\b/.test(q), "goal", "motivation");
        addIfExplicit(/\bcoding\b|\bstudy\b|\bstudying\b|\bfocus\b|\bdeep work\b/.test(q), "goal", "focus");
        addIfExplicit(/\bcomfort\b|\bchilling\b|\beating\b/.test(q), "goal", "comfort entertainment");
        addIfExplicit(/\bwith family\b|\bwith friends\b|\bmovie night\b/.test(q), "goal", "shared entertainment");

        addIfExplicit(/\bhome\b|\bhouse\b/.test(q), "context", "home");
        addIfExplicit(/\bgym\b|\bworkout\b/.test(q), "context", "gym");
        addIfExplicit(/\boffice\b|\bwork\b/.test(q), "context", "office");
        addIfExplicit(/\bcommute\b|\bdriving\b|\btravel\b/.test(q), "context", "commute");
        addIfExplicit(/\blate night\b/.test(q), "context", "late night");
        addIfExplicit(/\bparty\b/.test(q), "context", "party");
        addIfExplicit(/\bmovie night\b/.test(q), "context", "movie night");

        addIfExplicit(/\bfamily\b|\bparents\b|\bkids\b|\bchildren\b/.test(q), "company", "family");
        addIfExplicit(/\bfriends\b|\bgroup\b/.test(q), "company", "friends");
        addIfExplicit(/\bgirlfriend\b|\bboyfriend\b|\bpartner\b|\bwife\b|\bhusband\b/.test(q), "company", "partner");
        addIfExplicit(/\balone\b|\bsolo\b|\bmyself\b/.test(q), "company", "solo");

        addIfExplicit(/\beating\b|\bfood\b|\bdinner\b|\blunch\b/.test(q), "activity", "eating");
        addIfExplicit(/\bcoding\b|\bprogramming\b|\bdeveloper\b/.test(q), "activity", "coding");
        addIfExplicit(/\bstudying\b|\bstudy\b|\blearn\b/.test(q), "activity", "studying");
        addIfExplicit(/\bgym\b|\bworkout\b|\btraining\b|\bexercise\b/.test(q), "activity", "workout");
        addIfExplicit(/\brelaxing\b|\bchilling\b/.test(q), "activity", "relaxing");
        addIfExplicit(/\bdriving\b|\bcar\b/.test(q), "activity", "driving");

        addIfExplicit(/\bgym\b|\bworkout\b|\bhype\b|\bparty\b/.test(q), "energy", "high energy");
        addIfExplicit(/\bchilling\b|\bcomfort\b|\brelax\b|\brelaxing\b|\beating\b/.test(q), "energy", "low energy");
        addIfExplicit(/\bcoding\b|\bstudy\b|\bfocus\b|\bdeep work\b/.test(q), "energy", "focus");
    }

    const stopWords = new Set([
        "a", "an", "the", "and", "or", "but", "for", "with", "to", "of", "in", "on", "at", "by",
        "video", "videos", "movie", "movies", "show", "shows", "music", "song", "songs", "playlist",
        "comedy", "funny", "standup", "stand-up", "hindi", "english", "tamil", "telugu", "gaming",
        "coding", "study", "studying", "gym", "workout", "breakup", "family", "friends", "night",
        "late", "movie", "healing", "relatable", "home", "party", "channel", "channels", "creator"
    ]);

    const cleanCreatorToken = (value) => value.replace(/[^a-zA-Z0-9.]/g, "");

    const byMatch = rawQuery.match(/\bby\s+([A-Z][a-zA-Z0-9.]+(?:\s+[A-Z][a-zA-Z0-9.]+){0,2})\b/);
    if (byMatch) {
        preferences.creator.push(byMatch[1].trim());
    }

    const actionMatch = rawQuery.match(/\b(?:watch|listen to|play)\s+([A-Z][a-zA-Z0-9.]+(?:\s+[A-Z][a-zA-Z0-9.]+){0,2})\b/);
    if (actionMatch) {
        preferences.creator.push(actionMatch[1].trim());
    }

    const capitalizedPairs = rawQuery.match(/\b[A-Z][a-zA-Z0-9.]+\s+[A-Z][a-zA-Z0-9.]+\b/g) || [];
    for (const pair of capitalizedPairs) {
        const parts = pair.split(/\s+/).map(cleanCreatorToken);
        if (parts.every((part) => part && !stopWords.has(part.toLowerCase()))) {
            preferences.creator.push(parts.join(" "));
        }
    }

    if (profile) {
        const learnedCreators = new Set();
        (profile.creators || []).forEach((creator) => {
            if (creator) learnedCreators.add(creator.toLowerCase());
        });
        (profile.watchHistory || []).forEach((item) => {
            if (item.creator) learnedCreators.add(item.creator.toLowerCase());
        });
        (profile.feedbackHistory || []).forEach((item) => {
            if (item.creator) learnedCreators.add(item.creator.toLowerCase());
        });

        for (const learned of learnedCreators) {
            if (learned && q.includes(learned)) {
                const original =
                    profile.creators?.find((creator) => creator.toLowerCase() === learned) ||
                    profile.watchHistory?.find((item) => item.creator?.toLowerCase() === learned)?.creator ||
                    profile.feedbackHistory?.find((item) => item.creator?.toLowerCase() === learned)?.creator;
                if (original) {
                    preferences.creator.push(original);
                }
            }
        }
    }

    preferences.creator = unique(preferences.creator);

    if (
        preferences.contentType.length === 0 &&
        preferences.genre.length === 0 &&
        preferences.creator.length === 0 &&
        preferences.mood.length === 0 &&
        preferences.emotion.length === 0 &&
        preferences.goal.length === 0 &&
        preferences.context.length === 0 &&
        preferences.company.length === 0 &&
        preferences.activity.length === 0 &&
        preferences.energy.length === 0
    ) {
        preferences.genre.push("Entertainment");
    }

    return preferences;
};

const interpretWithGemini = async (query, profile = null) => {
    let geminiRawResponse = "";

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
Extract entertainment preferences from the query into a structured JSON object.
Return ONLY valid JSON.

Required output schema:
{
  "intent": "",
  "contentType": [],
  "genre": [],
  "creator": [],
  "mood": [],
  "emotion": [],
  "goal": [],
  "context": [],
  "company": [],
  "activity": [],
  "energy": []
}

Rules:
- Keep explicit queries minimal.
- Do not infer creator names from topical phrases.
- Only add context, company, activity, emotion, goal, or energy when the query clearly states them.
- Leave uncertain dimensions empty.

Query: "${query}"
`;

        console.log("===== GEMINI CALL =====");
        console.log("MODEL: gemini-2.5-flash");

        const result = await model.generateContent(prompt);
        geminiRawResponse = await result.response.text();

        const jsonMatch = geminiRawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON object found in response.");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const preferences = normalizeCanonicalSchema(parsed, query);

        const isEmpty =
            preferences.contentType.length === 0 &&
            preferences.genre.length === 0 &&
            preferences.creator.length === 0 &&
            preferences.mood.length === 0 &&
            preferences.emotion.length === 0 &&
            preferences.goal.length === 0 &&
            preferences.context.length === 0 &&
            preferences.company.length === 0 &&
            preferences.activity.length === 0 &&
            preferences.energy.length === 0;

        const finalPrefs = isEmpty ? getFallbackPreferences(query, profile) : preferences;
        const interpretationSource = isEmpty ? "FALLBACK" : "GEMINI";

        console.log("INTERPRETATION_SOURCE:", interpretationSource);
        console.log("CANONICAL_INTERPRETED_OUTPUT:", JSON.stringify(finalPrefs));

        return {
            preferences: finalPrefs,
            rawResponse: geminiRawResponse,
            fallbackActivated: isEmpty,
            interpretationSource
        };
    } catch (error) {
        console.log("===== GEMINI CALL =====");
        console.log("MODEL: gemini-2.5-flash");
        console.log("STATUS: error");
        console.log("ERROR BODY:", error.message);

        const fallbackPrefs = getFallbackPreferences(query, profile);
        console.log("INTERPRETATION_SOURCE:", "FALLBACK");
        console.log("CANONICAL_INTERPRETED_OUTPUT:", JSON.stringify(fallbackPrefs));

        return {
            preferences: fallbackPrefs,
            rawResponse: geminiRawResponse || `Error: ${error.message}`,
            fallbackActivated: true,
            interpretationSource: "FALLBACK"
        };
    }
};

module.exports = {
    interpretWithGemini
};
