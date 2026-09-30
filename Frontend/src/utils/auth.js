export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const getTokenData = () => {
    try {
        const token = getToken();
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

export const getRole = () => {
    const data = getTokenData();
    return data ? data.role : null;
};
