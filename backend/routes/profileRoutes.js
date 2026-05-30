const express = require("express");

const router = express.Router();

const {
    createProfile,
    getProfiles,
    getMyProfile,
    getProfileById,
    updateProfile,
    deleteProfile,
    getRecommendations,
    searchRecommendations,
    personalizedSearch,
    addToWatchHistory,
    addFeedback
} = require("../controllers/profileController");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

router.post(
    "/",
    verifyToken,
    createProfile
);

router.post(
    "/search",
    searchRecommendations
);

router.post(
    "/:id/search",
    verifyToken,
    personalizedSearch
);

router.post(
    "/:id/watch",
    verifyToken,
    addToWatchHistory
);

router.post(
    "/:id/feedback",
    verifyToken,
    addFeedback
);

router.get(
    "/",
    verifyToken,
    authorizeRole("admin"),
    getProfiles
);

router.get(
    "/me",
    verifyToken,
    getMyProfile
);

router.get(
    "/:id/recommendations",
    verifyToken,
    getRecommendations
);

router.get(
    "/:id",
    verifyToken,
    getProfileById
);

router.put(
    "/:id",
    verifyToken,
    updateProfile
);

router.delete(
    "/:id",
    verifyToken,
    authorizeRole("admin"),
    deleteProfile
);

module.exports = router;
