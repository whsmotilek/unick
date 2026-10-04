/**
 * Реквизиты и контакты проекта. Задаются переменными окружения при сборке (секреты GitHub Actions),
 * чтобы не править код. Обязательно заполнить до приёма реальных пользователей — их показывают
 * политика обработки персональных данных и условия использования.
 */
export const LEGAL = {
  /** Оператор персональных данных: ИП ФИО или наименование ООО */
  operator: (import.meta.env.VITE_LEGAL_OPERATOR as string | undefined) || 'Оператор платформы Unick (реквизиты уточняются)',
  /** ИНН / ОГРН(ИП) */
  requisites: (import.meta.env.VITE_LEGAL_REQUISITES as string | undefined) || '',
  /** Email для обращений, в том числе по персональным данным */
  email: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || '',
  updatedAt: '4 октября 2026',
};
