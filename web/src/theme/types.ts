// Theme types and interfaces
export interface MessageAction {
  icon: string;
  label: string;
  ariaLabel: string;
}

export interface WelcomeSuggestion {
  icon: string;
  text: string;
  color: string;
}

export interface ChatHistoryItem {
  id: number;
  title: string;
  timestamp: string;
}

export interface BottomAction {
  icon: React.ComponentType;
  label: string;
}

// Theme color interfaces
export interface ThemeColors {
  light: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
    status: {
      online: string;
      offline: string;
      onlineText: string;
      offlineText: string;
    };
  };
  dark: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
    status: {
      online: string;
      offline: string;
      onlineText: string;
      offlineText: string;
    };
  };
}
