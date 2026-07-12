import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  return 'dark'; // Forced default dark mode for this premium design
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getInitialTheme()
  },
  reducers: {
    toggleTheme: (state) => {
      const nextMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = nextMode;
      localStorage.setItem('theme', nextMode);
      
      // Update DOM class immediately
      if (nextMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    initTheme: (state) => {
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const { toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
