import api from '../api/client';

export const getTeachers = async () => {
    const response = await api.get('/users/teachers');
    return response.data;
};

export const getConversations = async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
};

export const getMessages = async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
};

export const sendMessage = async (receiverId, content) => {
    const response = await api.post('/messages', { receiverId, content });
    return response.data;
};
