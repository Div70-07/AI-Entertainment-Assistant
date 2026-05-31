const Profile = require("../models/Profile");
const { generateRecommendations } = require("../services/recommendationService");
const { interpretWithGemini } = require("../services/geminiService");

const pushUniquePreference = (arr, value) => {
    if (!value || value === "Unknown") return;

    const exists = arr.some(
        item => item.toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
        arr.push(value);
    }
};

const createProfile = async (req, res) => {

    try {

        // const profile = await Profile.create(req.body);

        const profile = await Profile.create({

            ...req.body,

            owner: req.user.userId

        });

        res.status(201).json(profile);

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getProfiles = async (req, res) => {

    try {

        const profiles =
            await Profile.find({
                owner: req.user.userId
            });

        res.status(200).json(profiles);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getMyProfile = async (req, res) => {

    try {

        const profile =
            await Profile.findOne({
                owner: req.user.userId
            });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json(profile);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getProfileById = async (req, res) => {

    try {

        const profile = await Profile.findOne({_id: req.params.id, owner: req.user.userId});
        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json(profile);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updateProfile = async (req, res) => {

    try {

        const profile =
            await Profile.findOneAndUpdate({ _id: req.params.id, owner: req.user.userId },
                req.body,
                {
                    new: true,
                    runValidators: true
                }

            );

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json(profile);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteProfile = async (req, res) => {

    try {

        const profile =
            await Profile.findOneAndDelete({
                _id: req.params.id,
                owner: req.user.userId
            });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json({
            message: "Profile deleted successfully"
        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getRecommendations = async (req, res) => {

    try {

        const profile =
            await Profile.findOne({
                _id: req.params.id,
                owner: req.user.userId
            });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        const recommendations = await generateRecommendations(profile);

        res.status(200).json(recommendations);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const searchRecommendations = async (req, res) => {

    try {

        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                message: "Query is required"
            });
        }

        const isAuditEnabled = process.env.DEBUG_SEARCH_AUDIT === "true";
        if (isAuditEnabled) {
            console.log("===== SEARCH START =====");
            console.log("RAW QUERY:", query);
        }

        const {
            preferences,
            rawResponse,
            fallbackActivated,
            interpretationSource
        } = await interpretWithGemini(query);

        const recommendationProfile = {
            genres: preferences.genre || [],
            creators: preferences.creator || [],
            moods: preferences.mood || []
        };

        console.log("RAW_USER_QUERY:", query);
        console.log("INTERPRETED_OUTPUT:", JSON.stringify(preferences));
        console.log("GEMINI_CALL_COUNT_PER_SEARCH:", 1);
        console.log("INTERPRETATION_SOURCE:", interpretationSource);

        const { builtQuery, recommendations } = await generateRecommendations(recommendationProfile, preferences, query);

        if (isAuditEnabled) {
            console.log("RECOMMENDATION COUNT:", recommendations.length);
            console.log("---------------- SEARCH PIPELINE AUDIT ----------------");
            console.log("RAW USER QUERY:      ", query);
            console.log("INTERPRETED QUERY:   ", preferences.intent);
            console.log("ACTIVE MODE:         ", (preferences.context && preferences.context.length > 0) ? "context" : "direct");
            console.log("YOUTUBE QUERY:       ", builtQuery);
            console.log("RESULT COUNT:        ", recommendations.length);
            console.log("-------------------------------------------------------");
            console.log("===== RESPONSE =====");
            console.log("STATUS SENT TO FRONTEND: 200");
        }

        console.log("FINAL_RESULT_COUNT:", recommendations.length);

        res.status(200).json({
            interpretedPreferences: preferences,
            builtQuery,
            recommendations
        });

    }
    catch (error) {
        if (process.env.DEBUG_SEARCH_AUDIT === "true") {
            console.log("===== RESPONSE =====");
            console.log("STATUS SENT TO FRONTEND: 500");
            console.error("Search API Error:", error.message);
        }

        res.status(500).json({
            message: error.message
        });

    }
};

const normalizePreferences = (arr = []) =>
    [...new Map(
        arr.map((item) => [
            (item || "").toLowerCase(),
            item
        ])
    ).values()];

const personalizedSearch = async (req, res) => {

    try {

        const profile =
            await Profile.findOne({
                _id: req.params.id,
                owner: req.user.userId
            });

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }

        const { query } = req.body;

        if (!query) {

            return res.status(400).json({
                message: "Query is required"
            });

        }

        const isAuditEnabled = process.env.DEBUG_SEARCH_AUDIT === "true";
        if (isAuditEnabled) {
            console.log("===== SEARCH START =====");
            console.log("RAW QUERY:", query);
        }

        const {
            preferences,
            rawResponse,
            fallbackActivated,
            interpretationSource
        } =
            await interpretWithGemini(query, profile);

        console.log("RAW_USER_QUERY:", query);
        console.log("INTERPRETED_OUTPUT:", JSON.stringify(preferences));
        console.log("GEMINI_CALL_COUNT_PER_SEARCH:", 1);
        console.log("INTERPRETATION_SOURCE:", interpretationSource);

        const {
            builtQuery,
            recommendations
        } =
            await generateRecommendations(
                profile,
                preferences,
                query
            );

        if (isAuditEnabled) {
            console.log("RECOMMENDATION COUNT:", recommendations.length);
            console.log("---------------- SEARCH PIPELINE AUDIT ----------------");
            console.log("RAW USER QUERY:      ", query);
            console.log("INTERPRETED QUERY:   ", preferences.intent);
            console.log("ACTIVE MODE:         ", (preferences.context && preferences.context.length > 0) ? "context" : "direct");
            console.log("YOUTUBE QUERY:       ", builtQuery);
            console.log("RESULT COUNT:        ", recommendations.length);
            console.log("-------------------------------------------------------");
            console.log("===== RESPONSE =====");
            console.log("STATUS SENT TO FRONTEND: 200");
        }

        console.log("FINAL_RESULT_COUNT:", recommendations.length);

        pushUniquePreference(profile.searchHistory, query);
        (preferences.genre || []).forEach(g => pushUniquePreference(profile.genres, g));
        (preferences.creator || []).forEach(c => pushUniquePreference(profile.creators, c));
        (preferences.mood || []).forEach(m => pushUniquePreference(profile.moods, m));

        await profile.save();

        res.status(200).json({

            interpretedPreferences:
                preferences,

            profilePreferences: {
                genres: profile.genres,
                creators: profile.creators,
                moods: profile.moods
            },

            builtQuery,

            recommendations

        });

    }

    catch (error) {
        if (process.env.DEBUG_SEARCH_AUDIT === "true") {
            console.log("===== RESPONSE =====");
            console.log("STATUS SENT TO FRONTEND: 500");
            console.error("Personalized Search API Error:", error.message);
        }

        res.status(500).json({
            message: error.message
        });

    }

};

const addToWatchHistory = async (req, res) => {

    try {

        const profile =
            await Profile.findOne({
                _id: req.params.id,
                owner: req.user.userId
            });

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }

        profile.watchHistory.push({

            title: req.body.title,

            creator: req.body.creator,

            genre: req.body.genre,

            mood: req.body.mood,

            videoId: req.body.videoId

        });

        pushUniquePreference(profile.genres, req.body.genre);
        pushUniquePreference(profile.creators, req.body.creator);
        pushUniquePreference(profile.moods, req.body.mood);

        await profile.save();

        res.status(200).json({

            message:
                "Watch history updated",

            watchHistory:
                profile.watchHistory || []

        });

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


const addFeedback = async (req, res) => {

    try {

        const profile =
            await Profile.findOne({
                _id: req.params.id,
                owner: req.user.userId
            });

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }

        profile.feedbackHistory.push({

            videoId: req.body.videoId,

            creator: req.body.creator,

            genre: req.body.genre,

            mood: req.body.mood,

            feedback: req.body.feedback || req.body.action,

            action: req.body.action || req.body.feedback

        });

        pushUniquePreference(profile.genres, req.body.genre);
        pushUniquePreference(profile.creators, req.body.creator);
        pushUniquePreference(profile.moods, req.body.mood);

        await profile.save();

        res.status(200).json({

            message:
                "Feedback saved successfully",

            feedbackHistory:
                profile.feedbackHistory

        });

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    createProfile,
    getProfiles,
    getMyProfile,
    getProfileById,
    addToWatchHistory,
    updateProfile,
    deleteProfile,
    getRecommendations,
    searchRecommendations,
    personalizedSearch,
    addFeedback
};
