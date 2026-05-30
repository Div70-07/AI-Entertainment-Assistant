const axios = require("axios");

const { classifyVideoMetadata } =
    require("./geminiService");

const fetchVideos = async (preferences)=>{

    const queryParts = [
        ...(preferences.genre || []),
        ...(preferences.creator || []),
        ...(preferences.mood || [])
    ].filter(Boolean);

    const builtQuery =
        queryParts.join(" ");

    const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
            params:{
                key:process.env.YOUTUBE_API_KEY,
                q:builtQuery,
                part:"snippet",
                type:"video",
                maxResults:5
            }
        }
    );

    const items =
        response.data.items;

    const videos =
        await Promise.all(

            items.map(async (item)=>{

                const title =
                    item.snippet.title;

                const description =
                    item.snippet.description;

                const classification =
                    await classifyVideoMetadata(
                        title,
                        description
                    );

                return {

                    title,

                    creator:
                        item.snippet.channelTitle,

                    description,

                    thumbnail:
                        item.snippet
                            .thumbnails
                            ?.high?.url,

                    videoId:
                        item.id.videoId,

                    genre:
                        classification.genre,

                    mood:
                        classification.mood

                };

            })

        );

    return {
        builtQuery,
        videos
    };
};

module.exports = { fetchVideos };