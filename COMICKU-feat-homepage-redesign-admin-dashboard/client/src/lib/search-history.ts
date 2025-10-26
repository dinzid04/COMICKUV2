const SEARCH_HISTORY_KEY = 'manhwa-search-history';
const MAX_HISTORY_ITEMS = 10;

export const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

export const addSearchHistory = (query: string) => {
  try {
    let history = getSearchHistory();
    // Remove existing query to move it to the top
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    // Add new query to the top
    history.unshift(query);
    // Limit history to MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
};

export const removeSearchHistory = (query: string) => {
    try {
        let history = getSearchHistory();
        history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error removing from search history:', error);
    }
}
