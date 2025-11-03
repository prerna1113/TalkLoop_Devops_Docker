import axios from "axios";

export const fetchChats = async (user) => {
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  const { data } = await axios.get("/api/chat", config);
  return data;
};
