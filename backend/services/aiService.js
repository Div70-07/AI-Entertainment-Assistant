const interpretQuery = (query)=>{

    const normalizedQuery = query.toLowerCase();
    const preferences = {};

    if(normalizedQuery.includes("coding") || normalizedQuery.includes("educational")){
        preferences.genre = "Technology";
    }

    if(normalizedQuery.includes("funny")){
        preferences.mood = "Relax";
    }

    return preferences;
};

module.exports = { interpretQuery };
