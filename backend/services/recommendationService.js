const { fetchVideos } = require("./youtubeService");

const DEBUG_SEARCH_AUDIT = process.env.DEBUG_SEARCH_AUDIT === "true";

const uniqueQueryParts = (parts = []) => [
    ...new Map(
        parts
            .filter(Boolean)
            .map((part) => [String(part).toLowerCase(), String(part)])
    ).values()
];

const formatRecommendationReason = (reasons) => {

    if (reasons.length === 1) {
        return reasons[0];
    }

    if (reasons.length === 2) {
        return `${reasons[0]} and ${reasons[1]}`;
    }

    return `${reasons.slice(0, -1).join(", ")}, and ${reasons[reasons.length - 1]}`;
};

const generateContextualReason = (item, interpretedPreferences, reasons) => {
    const q = (interpretedPreferences.intent || "").toLowerCase();
    const queryParts = [
        ...(interpretedPreferences.genre || []),
        ...(interpretedPreferences.creator || []),
        ...(interpretedPreferences.mood || []),
        ...(interpretedPreferences.emotion || []),
        ...(interpretedPreferences.goal || []),
        ...(interpretedPreferences.context || []),
        ...(interpretedPreferences.company || []),
        ...(interpretedPreferences.activity || []),
        ...(interpretedPreferences.energy || [])
    ].map(p => p.toLowerCase());

    const combinedText = `${item.title} ${item.description} ${item.creator}`.toLowerCase();

    // Check for "late-night focus coding"
    const hasLateNight = queryParts.includes("late night") || q.includes("late night");
    const hasCodingOrStudy = queryParts.includes("coding") || queryParts.includes("studying") || queryParts.includes("coding/studying") || q.includes("coding") || q.includes("study") || q.includes("studying") || q.includes("focus");
    if (hasLateNight && hasCodingOrStudy && (combinedText.includes("coding") || combinedText.includes("focus") || combinedText.includes("lofi") || combinedText.includes("lo-fi") || combinedText.includes("study") || combinedText.includes("chill"))) {
        return "Suggested for late-night focus coding.";
    }

    // Check for "workout motivation"
    const hasGym = queryParts.includes("gym") || queryParts.includes("workout") || q.includes("gym") || q.includes("workout");
    const hasMotivation = queryParts.includes("motivation") || queryParts.includes("hype") || q.includes("motivation") || q.includes("hype");
    if ((hasGym || hasMotivation) && (combinedText.includes("workout") || combinedText.includes("gym") || combinedText.includes("motivation") || combinedText.includes("hype") || combinedText.includes("energetic") || combinedText.includes("training"))) {
        return "Recommended for workout motivation.";
    }

    // Check for "family-friendly comedy vibes" / "family comedy"
    const hasFamily = queryParts.includes("family") || queryParts.includes("kids") || q.includes("family") || q.includes("kids");
    const hasComedy = queryParts.includes("comedy") || queryParts.includes("funny") || queryParts.includes("standup") || q.includes("comedy") || q.includes("funny") || q.includes("standup");
    if (hasFamily && hasComedy && (combinedText.includes("family") || combinedText.includes("kid") || combinedText.includes("funny") || combinedText.includes("comedy") || combinedText.includes("standup") || combinedText.includes("laugh"))) {
        return "Picked for family-friendly comedy vibes.";
    }

    // Check for "comfort watch for relaxing evenings" / "comfort watch"
    const hasComfort = queryParts.includes("comfort") || queryParts.includes("comfort entertainment") || queryParts.includes("chill") || queryParts.includes("relaxed") || q.includes("comfort") || q.includes("chill") || q.includes("relax") || q.includes("eating") || q.includes("alone") || q.includes("home");
    if (hasComfort && (combinedText.includes("relax") || combinedText.includes("chill") || combinedText.includes("cozy") || combinedText.includes("comfort") || combinedText.includes("soothing") || combinedText.includes("eating"))) {
        return "Good comfort watch for relaxing evenings.";
    }

    // Custom Context Reason
    if (queryParts.includes("late night")) {
        return "Suggested for late-night vibes.";
    }
    if (queryParts.includes("workout") || queryParts.includes("gym")) {
        return "Recommended for workout sessions.";
    }
    if (queryParts.includes("family") || queryParts.includes("kids")) {
        return "Recommended for family watching.";
    }
    if (queryParts.includes("eating") || queryParts.includes("food") || queryParts.includes("dinner")) {
        return "Suggested to watch while eating.";
    }
    if (queryParts.includes("party") || queryParts.includes("friends")) {
        return "Picked for social party entertainment.";
    }
    if (queryParts.includes("coding") || queryParts.includes("studying") || queryParts.includes("coding/studying")) {
        return "Recommended for study/focus sessions.";
    }

    // Fallback to formatted list of matching reasons
    if (reasons && reasons.length > 0) {
        return formatRecommendationReason(reasons);
    }

    return "Recommended for your current context.";
};

const detectQueryStrength = (query, interpretedPreferences) => {
    const q = (query || "").toLowerCase().trim();
    const prefs = interpretedPreferences || {};

    const hasGenre = prefs.genre && prefs.genre.length > 0;
    const hasCreator = prefs.creator && prefs.creator.length > 0;
    const hasMood = prefs.mood && prefs.mood.length > 0;
    const hasContext = prefs.context && prefs.context.length > 0;
    const hasEmotion = prefs.emotion && prefs.emotion.length > 0;
    const hasGoal = prefs.goal && prefs.goal.length > 0;
    const hasCompany = prefs.company && prefs.company.length > 0;
    const hasActivity = prefs.activity && prefs.activity.length > 0;
    const hasEnergy = prefs.energy && prefs.energy.length > 0;

    let specificityScore = 0;
    const reasons = [];

    // Specificity Boosts
    if (hasCreator) {
        specificityScore += 3.0;
        reasons.push("Explicit creator (+3.0)");
    }
    if (hasEmotion) {
        specificityScore += 2.0;
        reasons.push("Explicit emotional state (+2.0)");
    }
    if (hasGoal) {
        specificityScore += 2.0;
        reasons.push("Explicit goal (+2.0)");
    }
    if (hasGenre) {
        const firstGenre = prefs.genre[0].toLowerCase();
        if (firstGenre === "entertainment") {
            // No specificity boost for fallback Entertainment genre
        } else if (firstGenre === "music") {
            specificityScore += 1.0;
            reasons.push("Explicit genre (Music) (+1.0)");
        } else {
            specificityScore += 1.5;
            reasons.push(`Explicit genre (${prefs.genre[0]}) (+1.5)`);
        }
    }
    
    // Check for Comedy genre and funny mood redundancy
    const isRedundantMood = hasMood && hasGenre && 
        prefs.genre[0].toLowerCase() === "comedy" && 
        prefs.mood[0].toLowerCase() === "funny";

    if (hasMood && !isRedundantMood) {
        specificityScore += 1.0;
        reasons.push("Explicit mood (+1.0)");
    }
    if (hasContext) {
        specificityScore += 1.0;
        reasons.push("Explicit context (+1.0)");
    }
    if (hasCompany) {
        specificityScore += 1.0;
        reasons.push("Explicit company (+1.0)");
    }
    if (hasActivity) {
        specificityScore += 1.0;
        reasons.push("Explicit activity (+1.0)");
    }
    if (hasEnergy) {
        specificityScore += 1.0;
        reasons.push("Explicit energy (+1.0)");
    }

    // Vagueness Penalties
    const words = q.split(/\s+/).filter(Boolean);
    const weakTerms = new Set([
        "something", "anything", "idk", "whatever", "recommend", "show", "me", "fun",
        "videos", "video", "music", "movie", "movies", "song", "songs", "playlist", "playlists",
        "suggest", "please", "some", "good", "nice", "cool", "stuff", "random", "interesting",
        "to", "watch", "for", "any", "he", "she", "they", "we", "us", "him", "her", "them"
    ]);

    let weakCount = 0;
    for (const w of words) {
        if (weakTerms.has(w)) {
            specificityScore -= 0.5;
            weakCount++;
        }
    }
    if (weakCount > 0) {
        reasons.push(`Vagueness penalty (-${(weakCount * 0.5).toFixed(1)})`);
    }

    // Targeted Query length boost (differentiates "gym music" from "music")
    if (words.length >= 2) {
        const nonWeakCount = words.filter(w => !weakTerms.has(w)).length;
        if (nonWeakCount >= 2) {
            specificityScore += 0.5;
            reasons.push("Multi-word targeted query boost (+0.5)");
        }
    }

    // Direct single-word specific boost
    if (words.length === 1 && !weakTerms.has(words[0])) {
        specificityScore += 1.0;
        reasons.push("Single-word targeted query boost (+1.0)");
    }

    // Adjusted Classification Thresholds
    let strength = "medium";
    let confidence = "medium";

    const isVagueOverride = words.length > 0 && words.every(w => weakTerms.has(w));

    if (specificityScore >= 2.5) {
        strength = "strong";
        confidence = "high";
    } else if (specificityScore < 1.0 || isVagueOverride || words.length === 0) {
        strength = "weak";
        confidence = "high";
    }

    return {
        strength,
        confidence,
        specificityScore: parseFloat(specificityScore.toFixed(2)),
        reason: reasons.join(", ") || "Balanced context parameters"
    };
};

const hasContextKeywords = (query) => {
    const q = (query || "").toLowerCase();
    const keywords = [
        "gym", "workout", "exercise", "training", "home", "office", "work", "night", "morning", "evening",
        "family", "kids", "kid", "parent", "parents", "friend", "friends", "partner", "girlfriend", "boyfriend",
        "wife", "husband", "alone", "solo", "myself", "group", "eating", "dinner", "food", "lunch", "breakfast",
        "study", "studying", "focus", "coding", "programming", "developer", "drive", "driving", "car",
        "sad", "stressed", "heartbreak", "breakup", "happy", "angry", "stress", "chill", "relax", "comfort",
        "healing", "motivation", "study session", "movie night", "party", "social"
    ];
    return keywords.some(word => q.includes(word));
};

const getContextKeywordsCount = (query) => {
    const q = (query || "").toLowerCase();
    let count = 0;
    
    // Group keywords by category to identify distinct contextual dimensions
    const categories = [
        ["gym", "workout", "exercise", "training"],
        ["home", "office", "work", "night", "morning", "evening", "drive", "driving", "car", "travel", "commute", "late night"],
        ["family", "kids", "kid", "parent", "parents", "friend", "friends", "partner", "girlfriend", "boyfriend", "wife", "husband", "group"],
        ["alone", "solo", "myself"],
        ["eating", "dinner", "food", "lunch", "breakfast"],
        ["study", "studying", "focus", "coding", "programming", "developer", "study session"],
        ["sad", "stressed", "heartbreak", "breakup", "happy", "angry", "stress"],
        ["healing", "motivation"],
        ["movie night", "party", "social"],
        ["chill", "relax", "comfort"]
    ];
    
    for (const group of categories) {
        if (group.some(word => q.includes(word))) {
            count++;
        }
    }
    
    return count;
};

const generateRecommendations = async (
    profile,
    interpretedPreferences = {},
    rawQuery = ""
) => {
    const userProfile = profile || {};
    const watchHistory = userProfile.watchHistory || [];
    const feedbackHistory = userProfile.feedbackHistory || [];

    const queryForClassification = rawQuery || (interpretedPreferences && interpretedPreferences.intent) || "";
    const strengthObj = detectQueryStrength(queryForClassification, interpretedPreferences);
    let { strength, confidence, specificityScore, reason: strengthReason } = strengthObj;

    // 1. Determine Recommendation Mode
    const hasInterpreted = interpretedPreferences && Object.keys(interpretedPreferences).length > 0 && interpretedPreferences.intent;
    let mode = "passive"; // Mode 3
    if (hasInterpreted) {
        const hasSituation = interpretedPreferences.context && interpretedPreferences.context.length > 0;
        const hasEmotion = interpretedPreferences.emotion && interpretedPreferences.emotion.length > 0;
        const hasOutcome = interpretedPreferences.goal && interpretedPreferences.goal.length > 0;
        const hasAudience = interpretedPreferences.company && interpretedPreferences.company.length > 0;
        const hasActivity = (interpretedPreferences.activity && interpretedPreferences.activity.length > 0);
        const hasEnergy = (interpretedPreferences.energy && interpretedPreferences.energy.length > 0);

        const implicitGoalsOnly = hasOutcome && 
            (interpretedPreferences.goal || []).every(g => g === "shared entertainment" || g === "comfort entertainment") &&
            !(interpretedPreferences.goal || []).some(g => g !== "shared entertainment" && g !== "comfort entertainment");

        const containsContextKeywords = hasContextKeywords(queryForClassification);
        const contextualCount = getContextKeywordsCount(queryForClassification);
        const hasEmotionGoalActivity = hasEmotion || (hasOutcome && !implicitGoalsOnly) || hasActivity;

        // DIRECT MODE: if strong query AND no contextual dimensions (at most 1 contextual category in raw query)
        if (strength === "strong" && contextualCount <= 1) {
            mode = "direct";
        } else if (containsContextKeywords || hasEmotionGoalActivity) {
            mode = "context";
        } else {
            mode = "direct";
        }
    }

    // 2. Build Retrieval Query strictly based on Mode
    let fetchQuery = "";
    if (mode === "direct") {
        // Use raw query for clean retrieval with minimal enrichment
        const rawIntent = (rawQuery || interpretedPreferences.intent || "").trim();
        const queryParts = [
            ...(interpretedPreferences.genre || []),
            ...(interpretedPreferences.creator || []),
            ...(interpretedPreferences.mood || [])
        ].filter(Boolean);

        if (rawIntent) {
            fetchQuery = rawIntent;
        } else if (queryParts.length > 0) {
            fetchQuery = queryParts.join(" ");
        } else {
            fetchQuery = "trending entertainment content";
        }
    } else if (mode === "context") {
        const queryParts = [];
        const emotions = interpretedPreferences.emotion || [];
        if (emotions.length > 0) {
            queryParts.push(...emotions);
        }
        const contexts = interpretedPreferences.context || [];
        if (contexts.length > 0) {
            queryParts.push(...contexts);
        }
        const goals = interpretedPreferences.goal || [];
        if (goals.length > 0) {
            queryParts.push(...goals);
        }
        if (interpretedPreferences.mood && interpretedPreferences.mood.length > 0) {
            queryParts.push(...interpretedPreferences.mood);
        }
        if (interpretedPreferences.genre && interpretedPreferences.genre.length > 0) {
            queryParts.push(...interpretedPreferences.genre);
        }
        if (interpretedPreferences.contentType && interpretedPreferences.contentType.length > 0) {
            queryParts.push(...interpretedPreferences.contentType);
        }
        const companies = interpretedPreferences.company || [];
        if (companies.length > 0) {
            queryParts.push(...companies);
        }
        if (interpretedPreferences.activity && interpretedPreferences.activity.length > 0) {
            queryParts.push(...interpretedPreferences.activity);
        }
        if (interpretedPreferences.energy && interpretedPreferences.energy.length > 0) {
            queryParts.push(...interpretedPreferences.energy);
        }

        if (queryParts.length > 0) {
            fetchQuery = uniqueQueryParts(queryParts).join(" ");
        } else {
            fetchQuery = rawQuery || interpretedPreferences.intent;
        }
    } else {
        // Mode 3: Passive
        const queryParts = [];
        if (userProfile.genres && userProfile.genres.length > 0) {
            queryParts.push(userProfile.genres[0]);
        }
        if (userProfile.creators && userProfile.creators.length > 0) {
            queryParts.push(userProfile.creators[0]);
        }
        if (queryParts.length === 0 && userProfile.moods && userProfile.moods.length > 0) {
            queryParts.push(userProfile.moods[0]);
        }
        fetchQuery = queryParts.filter(Boolean).join(" ");
    }

    // 3. Fetch from YouTube with 3-Attempt Safe Fallback
    // Attempt 1: Primary mode query
        console.log("RETRIEVAL_ATTEMPT:", 1);
        console.log("FINAL_RETRIEVAL_QUERY:", fetchQuery);
    let fetchResult = await fetchVideos(fetchQuery || "trending entertainment content");
    let builtQuery = fetchResult.builtQuery;
    let videos = fetchResult.videos;

    // Attempt 2: Semantic simplification (Keep: genre, creator, mood, emotion, goal. Drop: energy, activity, etc.)
    if (videos.length === 0 && hasInterpreted) {
        console.log("RETRIEVAL_ATTEMPT:", 2);
        const attempt2Parts = [
            ...(interpretedPreferences.genre || []),
            ...(interpretedPreferences.creator || []),
            ...(interpretedPreferences.mood || []),
            ...(interpretedPreferences.emotion || []),
            ...(interpretedPreferences.goal || [])
        ].filter(Boolean);
        const attempt2Query = attempt2Parts.length > 0 ? uniqueQueryParts(attempt2Parts).join(" ") : (rawQuery || interpretedPreferences.intent);

        if (attempt2Query && attempt2Query !== fetchQuery) {
            console.log("FINAL_RETRIEVAL_QUERY:", attempt2Query);
            const secondAttempt = await fetchVideos(attempt2Query);
            builtQuery = secondAttempt.builtQuery;
            videos = secondAttempt.videos;
        }
    }

    // Attempt 3: Raw user query (userInput, no transformation)
    if (videos.length === 0 && hasInterpreted) {
        console.log("RETRIEVAL_ATTEMPT:", 3);
        const rawUserQuery = rawQuery || interpretedPreferences.intent || queryForClassification;
        if (rawUserQuery && rawUserQuery !== builtQuery && rawUserQuery !== fetchQuery) {
            console.log("FINAL_RETRIEVAL_QUERY:", rawUserQuery);
            const thirdAttempt = await fetchVideos(rawUserQuery);
            builtQuery = thirdAttempt.builtQuery;
            videos = thirdAttempt.videos;
        }
    }

    // Helper to calculate score for a video item
    const scoreVideo = (item, currentStrength) => {
        // Genre enrichment priority lookups
        let enrichedGenre = item.genre && item.genre !== "Unknown" ? item.genre : null;
        if (!enrichedGenre && interpretedPreferences.genre && interpretedPreferences.genre.length > 0) {
            enrichedGenre = interpretedPreferences.genre[0];
        }
        if (!enrichedGenre && userProfile.genres && userProfile.genres.length > 0) {
            enrichedGenre = userProfile.genres[0];
        }
        if (!enrichedGenre) {
            const combinedText = `${builtQuery || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();
            if (combinedText.includes("sci-fi") || combinedText.includes("scifi")) {
                enrichedGenre = "Sci-Fi";
            } else if (combinedText.includes("gaming") || combinedText.includes("game")) {
                enrichedGenre = "Gaming";
            } else if (combinedText.includes("coding") || combinedText.includes("technology") || combinedText.includes("tech") || combinedText.includes("programming") || combinedText.includes("developer")) {
                enrichedGenre = "Technology";
            } else if (combinedText.includes("standup") || combinedText.includes("comedy") || combinedText.includes("funny")) {
                enrichedGenre = "Comedy";
            } else if (combinedText.includes("documentary")) {
                enrichedGenre = "Documentary";
            } else if (combinedText.includes("music") || combinedText.includes("song")) {
                enrichedGenre = "Music";
            }
        }
        if (!enrichedGenre) {
            enrichedGenre = "Unknown";
        }

        // Mood enrichment priority lookups
        let enrichedMood = item.mood && item.mood !== "Unknown" ? item.mood : null;
        if (!enrichedMood && interpretedPreferences.mood && interpretedPreferences.mood.length > 0) {
            enrichedMood = interpretedPreferences.mood[0];
        }
        if (!enrichedMood && userProfile.moods && userProfile.moods.length > 0) {
            enrichedMood = userProfile.moods[0];
        }
        if (!enrichedMood) {
            const combinedText = `${builtQuery || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();
            if (combinedText.includes("funny") || combinedText.includes("comedy") || combinedText.includes("standup")) {
                enrichedMood = "Funny";
            } else if (combinedText.includes("focus") || combinedText.includes("coding") || combinedText.includes("study") || combinedText.includes("programming") || combinedText.includes("developer")) {
                enrichedMood = "Focus";
            } else if (combinedText.includes("chill") || combinedText.includes("relax")) {
                enrichedMood = "Chill";
            } else if (combinedText.includes("hype") || combinedText.includes("energetic")) {
                enrichedMood = "Energetic";
            } else if (combinedText.includes("tense") || combinedText.includes("thriller")) {
                enrichedMood = "Tense";
            }
        }
        if (!enrichedMood) {
            enrichedMood = "Unknown";
        }

        // Scoring matches
        const combinedText = `${item.title} ${item.description} ${item.creator}`.toLowerCase();
        const reasons = [];

        // 4a. queryMatch (+1.0)
        let queryMatchScore = 0.0;
        const rawQuery = (interpretedPreferences.intent || fetchQuery || "").toLowerCase();
        if (rawQuery) {
            if (combinedText.includes(rawQuery)) {
                queryMatchScore = 1.0;
            } else {
                const queryWords = rawQuery.split(/\s+/).filter(w => w.length > 2);
                const matchingWords = queryWords.filter(w => combinedText.includes(w));
                if (queryWords.length > 0 && matchingWords.length > 0) {
                    queryMatchScore = matchingWords.length / queryWords.length;
                }
            }
        }

        // 4b. intentMatch (+0.8)
        let intentMatchScore = 0.0;
        if (interpretedPreferences.intent) {
            const intentText = interpretedPreferences.intent.toLowerCase();
            if (combinedText.includes(intentText)) {
                intentMatchScore = 0.8;
            } else {
                const intentWords = intentText.split(/\s+/).filter(w => w.length > 2);
                const matchingWords = intentWords.filter(w => combinedText.includes(w));
                if (intentWords.length > 0 && matchingWords.length / intentWords.length >= 0.5) {
                    intentMatchScore = 0.8;
                }
            }
        }

        // 4c. emotionMatch (+0.7)
        let emotionMatchScore = 0.0;
        const emotions = interpretedPreferences.emotion || [];
        const hasEmotion = emotions.some(e => combinedText.includes(e.toLowerCase()));
        if (hasEmotion) {
            emotionMatchScore = 0.7;
        }

        // 4c_2. goalMatch (+0.7)
        let goalMatchScore = 0.0;
        const goals = interpretedPreferences.goal || [];
        const hasGoal = goals.some(g => combinedText.includes(g.toLowerCase()));
        if (hasGoal) {
            goalMatchScore = 0.7;
        }

        // 4d. moodMatch (+0.6)
        let moodMatchScore = 0.0;
        const hasMood = (interpretedPreferences.mood || []).some(
            m => enrichedMood && enrichedMood.toLowerCase() === m.toLowerCase()
        );
        if (hasMood) {
            moodMatchScore = 0.6;
        }

        // 4e. contextMatch (+0.5)
        let contextMatchScore = 0.0;
        const contexts = interpretedPreferences.context || [];
        const hasContext = contexts.some(c => combinedText.includes(c.toLowerCase()));
        if (hasContext) {
            contextMatchScore = 0.5;
        }

        // 4f. activityMatch (+0.5)
        let activityMatchScore = 0.0;
        const hasActivity = (interpretedPreferences.activity || []).some(
            a => {
                if (a.toLowerCase() === "workout") {
                    return combinedText.includes("workout") || combinedText.includes("exercise") || combinedText.includes("gym") || combinedText.includes("training");
                }
                if (a.toLowerCase() === "coding" || a.toLowerCase() === "coding/studying") {
                    return combinedText.includes("coding") || combinedText.includes("programming") || combinedText.includes("developer") || combinedText.includes("study") || combinedText.includes("studying");
                }
                return combinedText.includes(a.toLowerCase());
            }
        );
        if (hasActivity) {
            activityMatchScore = 0.5;
        }

        // 4g. companyMatch (+0.5)
        let companyMatchScore = 0.0;
        const companies = interpretedPreferences.company || [];
        const hasCompany = companies.some(
            a => {
                if (a.toLowerCase() === "family" || a.toLowerCase() === "kids" || a.toLowerCase() === "children") {
                    return combinedText.includes("family") || combinedText.includes("kid") || combinedText.includes("child") || combinedText.includes("friendly");
                }
                return combinedText.includes(a.toLowerCase());
            }
        );
        if (hasCompany) {
            companyMatchScore = 0.5;
        }

        // 4h. energyMatch (+0.4)
        let energyMatchScore = 0.0;
        const hasEnergy = (interpretedPreferences.energy || []).some(
            e => {
                if (e.toLowerCase() === "high energy" || e.toLowerCase() === "hype") {
                    return combinedText.includes("high energy") || combinedText.includes("hype") || combinedText.includes("workout") || combinedText.includes("energetic") || combinedText.includes("party");
                }
                if (e.toLowerCase() === "low energy" || e.toLowerCase() === "chill" || e.toLowerCase() === "relaxed") {
                    return combinedText.includes("low energy") || combinedText.includes("chill") || combinedText.includes("relax") || combinedText.includes("comfort");
                }
                return combinedText.includes(e.toLowerCase());
            }
        );
        if (hasEnergy) {
            energyMatchScore = 0.4;
        }

        // 4i. genreMatch (+0.4)
        let genreMatchScore = 0.0;
        const hasGenre = (interpretedPreferences.genre || []).some(
            g => enrichedGenre && enrichedGenre.toLowerCase() === g.toLowerCase()
        );
        if (hasGenre) {
            genreMatchScore = 0.4;
        }

        // 4j. creatorMatch (+0.4)
        let creatorMatchScore = 0.0;
        const hasCreator = (interpretedPreferences.creator || []).some(
            c => item.creator.toLowerCase().includes(c.toLowerCase())
        );
        if (hasCreator) {
            creatorMatchScore = 0.4;
        }

        // 4k. watchBoost (+0.2)
        let watchBoostScore = 0.0;
        const hasWatchHistoryMatch = watchHistory.some((historyItem) => {
            return (
                historyItem.creator?.toLowerCase() === item.creator?.toLowerCase() ||
                historyItem.genre?.toLowerCase() === enrichedGenre?.toLowerCase() ||
                (historyItem.title && item.title.toLowerCase().includes(historyItem.title.toLowerCase()))
            );
        });
        if (hasWatchHistoryMatch) {
            watchBoostScore = 0.2;
        }

        // 4l. feedbackBoost (+0.2)
        let feedbackBoostScore = 0.0;
        const likedCreator = feedbackHistory.some(f => f.feedback === "liked" && f.creator?.toLowerCase() === item.creator?.toLowerCase());
        if (likedCreator) feedbackBoostScore += 0.2;

        const likedGenre = feedbackHistory.some(f => f.feedback === "liked" && f.genre?.toLowerCase() === enrichedGenre?.toLowerCase());
        if (likedGenre) feedbackBoostScore += 0.2;

        const likedMood = feedbackHistory.some(f => f.feedback === "liked" && f.mood?.toLowerCase() === enrichedMood?.toLowerCase());
        if (likedMood) feedbackBoostScore += 0.2;

        const clickedCreator = feedbackHistory.some(f => f.feedback === "clicked" && f.creator?.toLowerCase() === item.creator?.toLowerCase());
        if (clickedCreator) feedbackBoostScore += 0.1;

        // 4m. Penalties (Soft penalties only, repeated dislike escalation disabled)
        let penaltyScore = 0.0;
        const isDislikedVideo = feedbackHistory.some(
            f => (f.feedback === "disliked" || f.action === "disliked") && f.videoId === item.videoId
        );
        if (isDislikedVideo) {
            penaltyScore += 0.5; // Soft penalty instead of hard exclude
        }

        const dislikedCreator = feedbackHistory.some(
            f => (f.feedback === "disliked" || f.action === "disliked") && f.creator?.toLowerCase() === item.creator?.toLowerCase()
        );
        if (dislikedCreator) {
            penaltyScore += 1.0; // Soft penalty, no escalation
        }

        const dislikedGenre = feedbackHistory.some(
            f => (f.feedback === "disliked" || f.action === "disliked") && f.genre?.toLowerCase() === enrichedGenre?.toLowerCase()
        );
        if (dislikedGenre) {
            penaltyScore += 0.7; // Soft penalty, no escalation
        }

        const skippedCreator = feedbackHistory.some(
            f => (f.feedback === "skipped" || f.action === "skipped") && f.creator?.toLowerCase() === item.creator?.toLowerCase()
        );
        if (skippedCreator) {
            penaltyScore += 0.4; // Soft penalty, no escalation
        }

        // Apply Dynamic Weights based on Query Strength
        let intentWeight = 1.0;
        let personalizationWeight = 1.0;

        if (currentStrength === "strong") {
            intentWeight = 1.2;
            personalizationWeight = 0.2;
        } else if (currentStrength === "weak") {
            intentWeight = 0.5;
            personalizationWeight = 1.3;
        }

        // Lightweight safety and social rules
        let safetySocialScore = 0.0;
        const companyArr = (interpretedPreferences.company || []).map(c => c.toLowerCase());
        const hasFamilyOrKids = companyArr.includes("family") || companyArr.includes("kids") || companyArr.includes("children");
        if (hasFamilyOrKids) {
            // Apply +0.8 family-safe boost to titles containing child/family/friendly keywords
            if (combinedText.includes("family") || combinedText.includes("kid") || combinedText.includes("child") || combinedText.includes("friendly") || combinedText.includes("disney") || combinedText.includes("pixar") || combinedText.includes("cartoon")) {
                safetySocialScore += 0.8;
                reasons.push("Family-friendly boost (+0.8)");
            }
            // Apply a heavy penalty (-2.0) to horror/nsfw/adult titles
            if (combinedText.includes("horror") || combinedText.includes("nsfw") || combinedText.includes("adult") || combinedText.includes("scary") || combinedText.includes("gore") || combinedText.includes("bloody")) {
                safetySocialScore -= 2.0;
                reasons.push("Family-unsafe horror/adult penalty (-2.0)");
            }
        }
        
        // If company includes 'friends' or 'party', boost high-energy content (+0.6)
        const hasFriendsOrParty = companyArr.includes("friends") || companyArr.includes("party") || companyArr.includes("social");
        if (hasFriendsOrParty) {
            if (combinedText.includes("hype") || combinedText.includes("party") || combinedText.includes("dance") || combinedText.includes("workout") || combinedText.includes("energetic") || combinedText.includes("high energy") || combinedText.includes("club") || combinedText.includes("remix")) {
                safetySocialScore += 0.6;
                reasons.push("Social/Party high-energy boost (+0.6)");
            }
        }

        // If goal/activity/context/mood includes 'comfort' (e.g. comfort watching, chilling), boost comfort content (+0.6)
        const goalsArr = (interpretedPreferences.goal || []).map(g => g.toLowerCase());
        const activitiesArr = (interpretedPreferences.activity || []).map(a => a.toLowerCase());
        const contextsArr = (interpretedPreferences.context || []).map(c => c.toLowerCase());
        const moodArr = (interpretedPreferences.mood || []).map(m => m.toLowerCase());
        
        const isComfortQuery = goalsArr.includes("comfort") || goalsArr.includes("comfort entertainment") || activitiesArr.includes("relaxing") || activitiesArr.includes("chilling") || contextsArr.includes("home") || moodArr.includes("chill") || moodArr.includes("relaxed") || moodArr.includes("comfort");
        if (isComfortQuery) {
            if (combinedText.includes("cozy") || combinedText.includes("relax") || combinedText.includes("chill") || combinedText.includes("comfort") || combinedText.includes("soothing") || combinedText.includes("lofi") || combinedText.includes("lo-fi") || combinedText.includes("peaceful")) {
                safetySocialScore += 0.6;
                reasons.push("Comfort entertainment boost (+0.6)");
            }
        }

        // Calculate relevance matches
        const relevanceMatchScore =
            queryMatchScore +
            intentMatchScore +
            emotionMatchScore +
            goalMatchScore +
            moodMatchScore +
            contextMatchScore +
            activityMatchScore +
            companyMatchScore +
            energyMatchScore +
            genreMatchScore +
            creatorMatchScore;

        const personalizationScore = watchBoostScore + feedbackBoostScore;

        const requiresQueryMatch = (currentStrength === "strong" || currentStrength === "medium") && (mode === "direct" || mode === "context");

        let score = 0.0;
        if (requiresQueryMatch && relevanceMatchScore === 0) {
            score = 0.0;
        } else {
            const baseScore = (mode === "passive" || currentStrength === "weak") ? 1.0 : 0.0;
            score = baseScore + (relevanceMatchScore * intentWeight) + (personalizationScore * personalizationWeight) + safetySocialScore - penaltyScore;

            if (queryMatchScore > 0) reasons.push("Direct query match");
            if (intentMatchScore > 0) reasons.push("Matched intent");
            if (emotionMatchScore > 0) reasons.push("Aligned with emotional state");
            if (goalMatchScore > 0) reasons.push("Aligned with goal/desired outcome");
            if (moodMatchScore > 0) reasons.push("Matched mood");
            if (contextMatchScore > 0) reasons.push("Matched context");
            if (activityMatchScore > 0) reasons.push("Matched activity");
            if (companyMatchScore > 0) reasons.push("Matched company");
            if (energyMatchScore > 0) reasons.push("Matched energy");
            if (genreMatchScore > 0) reasons.push("Matches genre preference");
            if (creatorMatchScore > 0) reasons.push("Matches creator preference");
            if (watchBoostScore > 0) reasons.push("Matched watch history");
            if (feedbackBoostScore > 0) reasons.push("Refined by liked preference");
            if (isDislikedVideo) reasons.push("Soft penalized disliked video");
            if (dislikedCreator) reasons.push("Soft penalized disliked creator");
            if (dislikedGenre) reasons.push("Soft penalized disliked genre");
            if (skippedCreator) reasons.push("Soft penalized skipped creator");
        }

        // Calculate semantic matches count for confidence rating
        let semanticMatchCount = 0;
        if (emotionMatchScore > 0) semanticMatchCount++;
        if (goalMatchScore > 0) semanticMatchCount++;
        if (contextMatchScore > 0) semanticMatchCount++;
        if (activityMatchScore > 0) semanticMatchCount++;
        if (companyMatchScore > 0) semanticMatchCount++;
        if (energyMatchScore > 0) semanticMatchCount++;
        if (moodMatchScore > 0) semanticMatchCount++;
        if (genreMatchScore > 0) semanticMatchCount++;
        if (creatorMatchScore > 0) semanticMatchCount++;

        let itemConfidence = "MEDIUM";
        if (currentStrength === "strong" && semanticMatchCount >= 2) {
            itemConfidence = "HIGH";
        } else if (currentStrength === "weak" && semanticMatchCount <= 1) {
            itemConfidence = "LOW";
        } else {
            itemConfidence = "MEDIUM";
        }

        return {
            ...item,
            genre: enrichedGenre,
            mood: enrichedMood,
            score: parseFloat(score.toFixed(2)),
            confidence: itemConfidence,
            recommendationReason: generateContextualReason(item, interpretedPreferences, reasons)
        };
    };

    // 5. Scoring Loop (Attempt 1: with detected query strength)
    let scoredItems = videos.map(v => scoreVideo(v, strength));

    let postFilterResults = scoredItems.filter((item) => item !== null);
    let postSuppressionResults = postFilterResults.filter((item) => item.score > 0);
    let recommendations = [...postSuppressionResults].sort((a, b) => b.score - a.score);

    // Safeguard: Fallback downgrade if strong query yields 0 scored candidates
    let downgraded = false;
    if (strength === "strong" && recommendations.length === 0 && videos.length > 0) {
        downgraded = true;
        strength = "medium";

        // Re-score with medium behavior
        scoredItems = videos.map(v => scoreVideo(v, strength));
        postFilterResults = scoredItems.filter((item) => item !== null);
        postSuppressionResults = postFilterResults.filter((item) => item.score > 0);
        recommendations = [...postSuppressionResults].sort((a, b) => b.score - a.score);
    }

    // 6. Safe Fallback Mode
    if (recommendations.length === 0 && videos.length > 0) {
        recommendations = videos.map(video => ({
            ...video,
            score: 0.1, // default safe fallback score
            confidence: "LOW",
            recommendationReason: "Raw YouTube candidate (safe fallback mode)"
        }));
    } else if (recommendations.length < 3) {
        // Guarantee minimum visible results.
        const existingIds = new Set(recommendations.map(r => r.videoId).filter(Boolean));
        for (const video of scoredItems) {
            if (recommendations.length >= 3) break;
            if (video && !existingIds.has(video.videoId)) {
                recommendations.push({
                    ...video,
                    score: 0.1, // default safe fallback score
                    confidence: video.confidence || "LOW",
                    recommendationReason: video.recommendationReason || "Recommended candidate (safe fallback mode)"
                });
            }
        }
    }

    // 7. Backend Metrics & Diagnostic Logging
    if (DEBUG_SEARCH_AUDIT) {
        console.log("RAW USER QUERY:", rawQuery || queryForClassification);
        console.log("INTERPRETED QUERY:", (interpretedPreferences && interpretedPreferences.intent) || "N/A");
        console.log("ACTIVE MODE:", mode);
        console.log("YOUTUBE QUERY:", builtQuery);
        console.log("RESULT COUNT:", recommendations.length);
    }

    return {
        builtQuery,
        recommendations
    };
};

module.exports = { generateRecommendations, detectQueryStrength };
