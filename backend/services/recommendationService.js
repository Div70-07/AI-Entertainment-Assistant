const { fetchVideos } = require("./youtubeService");

const formatRecommendationReason = (reasons) => {

    if (reasons.length === 1) {
        return reasons[0];
    }

    if (reasons.length === 2) {
        return `${reasons[0]} and ${reasons[1]}`;
    }

    return `${reasons.slice(0, -1).join(", ")}, and ${reasons[reasons.length - 1]}`;
};

const generateRecommendations = async (
    profile,
    interpretedPreferences = {}
) => {

    const preferences = {
        genre: profile.genres || interpretedPreferences.genre || [],
        creator: profile.creators || interpretedPreferences.creator || [],
        mood: profile.moods || interpretedPreferences.mood || []
    };

    const { builtQuery, videos } =
        await fetchVideos(preferences);

    const watchHistory = profile.watchHistory || [];
    const feedbackHistory = profile.feedbackHistory || [];
    const genres = profile.genres || [];
    const creators = profile.creators || [];
    const moods = profile.moods || [];

    const recommendations = videos
        .map((item) => {

            let score = 0;
            const reasons = [];
            const searchText =
                `${item.title} ${item.description} ${item.creator}`.toLowerCase();

            const hasGenreMatch =
                preferences.genre.some((genre) =>
                    item.genre &&
                    item.genre.toLowerCase() === genre.toLowerCase()
                );

            if (hasGenreMatch) {
                score += 2;
                reasons.push("Matched classified genre");
            }

            const matchedCreator =
                creators.find((creator) =>
                    item.creator.toLowerCase().includes(creator.toLowerCase())
                );

            if (matchedCreator) {
                score += 3;
                reasons.push(`Matched ${matchedCreator} creator`);
            }

            const hasMoodMatch =
                preferences.mood.some((mood) =>
                    item.mood &&
                    item.mood.toLowerCase() === mood.toLowerCase()
                );

            if (hasMoodMatch) {
                score += 1;
                reasons.push("Matched classified mood");
            }


            const hasWatchHistoryMatch =
                watchHistory.some((historyItem) => {

                    return (

                        historyItem.creator
                            ?.toLowerCase()
                        ===
                        item.creator
                            ?.toLowerCase()

                        ||

                        historyItem.genre
                            ?.toLowerCase()
                        ===
                        item.genre
                            ?.toLowerCase()

                        ||

                        historyItem.title
                            ?.toLowerCase()
                            .includes(
                                item.title.toLowerCase()
                            )

                    );

                });

            if (hasWatchHistoryMatch) {
                score += 3;
                reasons.push("Matched watch history");
            }

            const likedCreator =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "liked"

                        &&

                        feedbackItem.creator
                            ?.toLowerCase()

                        ===

                        item.creator
                            ?.toLowerCase()
                );

            if (likedCreator) {

                score += 4;

                reasons.push(
                    "Matched liked creator"
                );

            }

            const likedGenre =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "liked"

                        &&

                        feedbackItem.genre
                            ?.toLowerCase()

                        ===

                        item.genre
                            ?.toLowerCase()
                );

            if (likedGenre) {

                score += 3;

                reasons.push(
                    "Matched liked genre"
                );

            }

            const dislikedCreator =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "disliked"

                        &&

                        feedbackItem.creator
                            ?.toLowerCase()

                        ===

                        item.creator
                            ?.toLowerCase()
                );

            if (dislikedCreator) {

                score -= 4;

                reasons.push(
                    "Penalized disliked creator"
                );

            }

            const likedMood =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "liked"

                        &&

                        feedbackItem.mood
                            ?.toLowerCase()

                        ===

                        item.mood
                            ?.toLowerCase()
                );

            if (likedMood) {

                score += 2;

                reasons.push(
                    "Matched liked mood"
                );

            }

            const clickedCreator =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "clicked"

                        &&

                        feedbackItem.creator
                            ?.toLowerCase()

                        ===

                        item.creator
                            ?.toLowerCase()
                );

            if (clickedCreator) {

                score += 2;

                reasons.push(
                    "Matched clicked creator"
                );

            }

            const skippedCreator =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "skipped"

                        &&

                        feedbackItem.creator
                            ?.toLowerCase()

                        ===

                        item.creator
                            ?.toLowerCase()
                );

            if (skippedCreator) {

                score -= 2;

                reasons.push(
                    "Penalized skipped creator"
                );

            }

            const dislikedGenre =
                feedbackHistory.some(
                    (feedbackItem) =>

                        feedbackItem.feedback === "disliked"

                        &&

                        feedbackItem.genre
                            ?.toLowerCase()

                        ===

                        item.genre
                            ?.toLowerCase()
                );

            if (dislikedGenre) {

                score -= 3;

                reasons.push(
                    "Penalized disliked genre"
                );

            }

            const hasIntentMatch =
                (interpretedPreferences.genre || []).some((genre) =>
                    searchText.includes(genre.toLowerCase())
                ) ||
                (interpretedPreferences.creator || []).some((creator) =>
                    item.creator.toLowerCase().includes(creator.toLowerCase())
                ) ||
                (interpretedPreferences.mood || []).some((mood) =>
                    searchText.includes(mood.toLowerCase())
                );

            if (hasIntentMatch) {
                score += 2;
                reasons.push("Matched query intent");
            }

            return {
                ...item,
                score,
                recommendationReason:
                    formatRecommendationReason(reasons)
            };

        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return {
        builtQuery,
        recommendations
    };
};

module.exports = { generateRecommendations };
