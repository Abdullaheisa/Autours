import { ContestSettingsDTO, ContestRegistrationDTO } from './contest.types';

const SETTINGS_KEY = 'autours_contest_settings';
const REGISTRATIONS_KEY = 'autours_contest_registrations';

export class ContestStorage {
  static getSettings(): ContestSettingsDTO | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  }

  static saveSettings(settings: ContestSettingsDTO): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static getRegistrations(): ContestRegistrationDTO[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(REGISTRATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveRegistrations(registrations: ContestRegistrationDTO[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
  }
}
