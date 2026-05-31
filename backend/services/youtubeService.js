const axios = require("axios");

const inferVideoMetadata = ({
    title = "",
    description = "",
    channelTitle = "",
    query = ""
}) => {
    const combinedText = `${title} ${description} ${channelTitle} ${query}`.toLowerCase();

    let genre = "Unknown";
    if (combinedText.includes("sci-fi") || combinedText.includes("scifi")) {
        genre = "Sci-Fi";
    } else if (combinedText.includes("gaming") || combinedText.includes("game")) {
        genre = "Gaming";
    } else if (
        combinedText.includes("coding") ||
        combinedText.includes("technology") ||
        combinedText.includes("tech") ||
        combinedText.includes("programming") ||
        combinedText.includes("developer")
    ) {
        genre = "Technology";
    } else if (
        combinedText.includes("standup") ||
        combinedText.includes("stand-up") ||
        combinedText.includes("comedy") ||
        combinedText.includes("funny")
    ) {
        genre = "Comedy";
    } else if (combinedText.includes("documentary")) {
        genre = "Documentary";
    } else if (
        combinedText.includes("music") ||
        combinedText.includes("song") ||
        combinedText.includes("playlist") ||
        combinedText.includes("beats")
    ) {
        genre = "Music";
    } else if (
        combinedText.includes("football") ||
        combinedText.includes("soccer") ||
        combinedText.includes("sports")
    ) {
        genre = "Sports";
    } else if (
        combinedText.includes("thriller") ||
        combinedText.includes("horror") ||
        combinedText.includes("mystery")
    ) {
        genre = "Thriller";
    }

    let mood = "Unknown";
    if (
        combinedText.includes("funny") ||
        combinedText.includes("comedy") ||
        combinedText.includes("standup")
    ) {
        mood = "Funny";
    } else if (
        combinedText.includes("focus") ||
        combinedText.includes("coding") ||
        combinedText.includes("study") ||
        combinedText.includes("deep work")
    ) {
        mood = "Focus";
    } else if (
        combinedText.includes("chill") ||
        combinedText.includes("relax") ||
        combinedText.includes("cozy") ||
        combinedText.includes("comfort")
    ) {
        mood = "Chill";
    } else if (
        combinedText.includes("hype") ||
        combinedText.includes("energetic") ||
        combinedText.includes("workout") ||
        combinedText.includes("gym")
    ) {
        mood = "Energetic";
    } else if (
        combinedText.includes("tense") ||
        combinedText.includes("thriller") ||
        combinedText.includes("horror") ||
        combinedText.includes("scary")
    ) {
        mood = "Tense";
    } else if (
        combinedText.includes("learn") ||
        combinedText.includes("explained") ||
        combinedText.includes("documentary") ||
        combinedText.includes("education")
    ) {
        mood = "Informative";
    }

    return { genre, mood };
};

const fetchVideos = async (query) => {
    const builtQuery = typeof query === "string" ? query.trim() : "";

    if (process.env.MOCK_YOUTUBE === "true") {
        console.log(`[MOCK YOUTUBE] Returning deterministic test candidates for: "${builtQuery}"`);
        console.log("YOUTUBE_STATUS:", 200);
        return {
            builtQuery,
            status: 200,
            videos: [
                {
                    videoId: "vid_1",
                    title: "Lofi Study Beats for Late Night Coding",
                    creator: "Lofi Girl",
                    description: "Relaxing chill beats to focus, study, code, and write.",
                    genre: "Music",
                    mood: "Focus"
                },
                {
                    videoId: "vid_2",
                    title: "Heavy Gym Workout Motivation Mix",
                    creator: "Gym Hype Music",
                    description: "High energy tracks to motivate your exercise and lifting sessions.",
                    genre: "Music",
                    mood: "Energetic"
                },
                {
                    videoId: "vid_3",
                    title: "Extremely Scary Horror Movie Night",
                    creator: "ScaryChannel",
                    description: "Spooky horror thriller stories for late night watching.",
                    genre: "Thriller",
                    mood: "Tense"
                },
                {
                    videoId: "vid_4",
                    title: "Funny Standup Comedy Family Night Special",
                    creator: "LaughFactory",
                    description: "A funny and clean standup comedy show for the entire family.",
                    genre: "Comedy",
                    mood: "Funny"
                },
                {
                    videoId: "vid_5",
                    title: "Cozy Comfort Food Cooking at Home",
                    creator: "CozyBites",
                    description: "Chilling and relaxing tutorial on cooking comfort meals at home alone.",
                    genre: "Entertainment",
                    mood: "Relax"
                }
            ]
        };
    }

    try {
        console.log("===== YOUTUBE CALL =====");
        console.log("QUERY:", builtQuery);
        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    q: builtQuery,
                    part: "snippet",
                    type: "video",
                    maxResults: 5
                }
            }
        );
        console.log("YOUTUBE_STATUS:", response.status);

        const items = response.data.items || [];

        const videos = items.map((item) => {
            const title = item.snippet.title;
            const description = item.snippet.description;
            const creator = item.snippet.channelTitle;
            const inferred = inferVideoMetadata({
                title,
                description,
                channelTitle: creator,
                query: builtQuery
            });

            return {
                title,
                creator,
                description,
                thumbnail: item.snippet.thumbnails?.high?.url,
                videoId: item.id.videoId,
                genre: inferred.genre,
                mood: inferred.mood
            };
        });

        return {
            builtQuery,
            status: response.status,
            videos
        };
    } catch (error) {
        const status = error.response?.status || "ERROR";
        console.log("YOUTUBE_STATUS:", status);
        console.log("ERROR BODY:", error.message);
        return {
            builtQuery,
            status,
            videos: []
        };
    }
};

module.exports = { fetchVideos };
