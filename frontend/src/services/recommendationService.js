import api from "./api";

export async function personalizedSearch(profileId, query) {
  const response = await api.post(`/profile/${profileId}/search`, {
    query,
  });

  return response.data;
}

export async function addToWatchHistory(profileId, payload) {
  const response = await api.post(`/profile/${profileId}/watch`, payload);
  return response.data;
}

export async function addFeedback(profileId, payload) {
  const response = await api.post(`/profile/${profileId}/feedback`, payload);
  return response.data;
}
