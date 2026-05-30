const Profile = require("../models/Profile");
const { generateRecommendations } = require("../services/recommendationService");
const { interpretWithGemini } = require("../services/geminiService");

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

        const preferences = await interpretWithGemini(query);

        const recommendationProfile = {
            genres: preferences.genre || [],
            creators: preferences.creator || [],
            moods: preferences.mood || []
        };

        const { builtQuery, recommendations } = await generateRecommendations(recommendationProfile, preferences);

        res.status(200).json({
            interpretedPreferences: preferences,
            builtQuery,
            recommendations
        });

    }
    catch (error) {

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

        const preferences =
            await interpretWithGemini(query);

        const mergedProfile = {
            genres: normalizePreferences([
                ...(preferences.genre || []),
                ...(profile.genres || []).slice(0, 2)
            ]),

            creators: normalizePreferences([
                ...(preferences.creator || []),
                ...(profile.creators || []).slice(0, 2)
            ]),

            moods: normalizePreferences([
                ...(preferences.mood || []),
                ...(profile.moods || []).slice(0, 2)
            ]),
            watchHistory: profile.watchHistory || [],
        };

        const {
            builtQuery,
            recommendations
        } =
            await generateRecommendations(
                mergedProfile,
                preferences
            );

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

            feedback: req.body.feedback

        });

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
