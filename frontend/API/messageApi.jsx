export const sendMessage = async (content, chatId, user) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  };

  const { data } = await axios.post(
    "/api/message",
    { content, chatId },
    config
  );
  return data;
};
