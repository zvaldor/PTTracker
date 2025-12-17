export type Locale = 'en' | 'ru';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    analytics: 'Analytics',
    settings: 'Settings',

    // Planning modes
    weekly: 'Weekly',
    monthly: 'Monthly',
    range: 'Range',

    // Task sections
    today: 'Today',
    recurringFrequent: 'Recurring (More than once per week)',
    backlog: 'Backlog',

    // Task actions
    createTask: 'Create Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    markDone: 'Mark as Done',
    archive: 'Archive',
    move: 'Move',

    // Task fields
    title: 'Title',
    description: 'Description',
    category: 'Category',
    difficulty: 'Difficulty',
    desire: 'Desire',
    status: 'Status',

    // Difficulty
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra Large',

    // Desire
    low: 'Low',
    med: 'Medium',
    high: 'High',

    // Status
    todo: 'To Do',
    done: 'Done',
    archived: 'Archived',

    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    magicLink: 'Magic Link',
    sendMagicLink: 'Send Magic Link',

    // Settings
    profile: 'Profile',
    language: 'Language',
    theme: 'Theme',
    weekStart: 'Week Starts On',
    monday: 'Monday',
    sunday: 'Sunday',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    notifications: 'Notifications',
    dataSync: 'Data & Sync',
    lastSync: 'Last Sync',
    resetCache: 'Reset Local Cache',

    // Analytics
    filters: 'Filters',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    custom: 'Custom',
    whatYouDoFirst: 'What You Do First',
    weeklyEfficiency: 'Weekly Efficiency',
    carryovers: 'Carryovers',
    completionRate: 'Completion Rate',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  ru: {
    // Navigation
    home: 'Главная',
    analytics: 'Аналитика',
    settings: 'Настройки',

    // Planning modes
    weekly: 'Неделя',
    monthly: 'Месяц',
    range: 'Диапазон',

    // Task sections
    today: 'Сегодня',
    recurringFrequent: 'Повторяющиеся (Больше раза в неделю)',
    backlog: 'Бэклог',

    // Task actions
    createTask: 'Создать задачу',
    editTask: 'Редактировать',
    deleteTask: 'Удалить',
    markDone: 'Завершить',
    archive: 'Архивировать',
    move: 'Переместить',

    // Task fields
    title: 'Название',
    description: 'Описание',
    category: 'Категория',
    difficulty: 'Сложность',
    desire: 'Желание',
    status: 'Статус',

    // Difficulty
    small: 'Малая',
    medium: 'Средняя',
    large: 'Большая',
    extraLarge: 'Очень большая',

    // Desire
    low: 'Низкое',
    med: 'Среднее',
    high: 'Высокое',

    // Status
    todo: 'К выполнению',
    done: 'Выполнено',
    archived: 'Архив',

    // Auth
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    magicLink: 'Магическая ссылка',
    sendMagicLink: 'Отправить ссылку',

    // Settings
    profile: 'Профиль',
    language: 'Язык',
    theme: 'Тема',
    weekStart: 'Неделя начинается',
    monday: 'Понедельник',
    sunday: 'Воскресенье',
    system: 'Системная',
    light: 'Светлая',
    dark: 'Темная',
    notifications: 'Уведомления',
    dataSync: 'Данные и синхронизация',
    lastSync: 'Последняя синхронизация',
    resetCache: 'Сбросить локальный кэш',

    // Analytics
    filters: 'Фильтры',
    thisWeek: 'Эта неделя',
    lastWeek: 'Прошлая неделя',
    thisMonth: 'Этот месяц',
    custom: 'Свой диапазон',
    whatYouDoFirst: 'Что делаете сначала',
    weeklyEfficiency: 'Эффективность за неделю',
    carryovers: 'Переносы',
    completionRate: 'Процент выполнения',

    // Common
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    close: 'Закрыть',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
  },
};

export function useTranslation(locale: Locale) {
  return {
    t: (key: keyof typeof translations.en): string => {
      return translations[locale][key] || translations.en[key] || key;
    },
    locale,
  };
}
