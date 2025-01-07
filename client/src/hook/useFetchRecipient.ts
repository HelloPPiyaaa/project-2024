import { useEffect, useState } from "react";
import { getRequest } from "../api/chat";

interface Chat {
  _id: string;
  members: string[];
}

interface User {
  _id: string;
  fullname: string;
  profile_picture: string;
}

export const useFetchRecipientUser = (
  chat: Chat | null,
  access_token: string | null
) => {
  const [recipientUser, setRecipientUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recipientId = chat?.members.find((id) => id !== access_token);

  useEffect(() => {
    const getUser = async () => {
      if (!recipientId) return;

      try {
        const response = await getRequest(
          `${import.meta.env.VITE_DOMAIN}/users/find/${recipientId}`
        );

        if (response.error) {
          setError(response.error);
        } else {
          setRecipientUser(response);
        }
      } catch (error) {
        setError("Failed to fetch recipient user");
        console.error(error);
      }
    };

    if (chat && access_token) {
      getUser();
    }
  }, [chat, recipientId, access_token]);

  return { recipientUser, error };
};
