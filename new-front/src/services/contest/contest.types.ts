export interface ContestRegistrationDTO {
  id: string;
  name: string;
  phone: string;
  email: string;
  country?: string;
  date: string;
}

export interface ContestSettingsDTO {
  enabled: boolean;
  campaignVersion: number;
  forceInteraction: boolean;
  banner?: string | null;
}

export interface RegisterUserPayload {
  name: string;
  phone: string;
  email: string;
  country?: string;
}
