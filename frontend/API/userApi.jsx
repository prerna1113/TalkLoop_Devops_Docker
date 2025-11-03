export const getUserProfile = async (user) => {
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  const { data } = await axios.get(`/api/user/${user._id}`, config);
  return data;
};
