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
