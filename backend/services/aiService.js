const interpretQuery = (query)=>{

    const normalizedQuery = query.toLowerCase();
    const preferences = {};

    if(normalizedQuery.includes("coding") || normalizedQuery.includes("educational")){
        preferences.genre = "Technology";
    }

    if(normalizedQuery.includes("funny")){
        preferences.mood = "Relax";
    }

    if(normalizedQuery.includes("youtube")){
        preferences.creator = "MrBeast";
    }

    return preferences;
};

module.exports = { interpretQuery };
