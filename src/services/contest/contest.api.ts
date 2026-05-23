/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CONTEST API  — Dual-mode: Real API  ↔  Mock fallback
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Set  NEXT_PUBLIC_USE_REAL_API=true  in .env.local to switch to the real
 * backend.  While the backend is not ready, the mock layer is used automatically.
 *
 * Real endpoints (base: NEXT_PUBLIC_API_BASE_URL):
 *   GET    /api/admin/contest/settings
 *   PUT    /api/admin/contest/settings
 *   POST   /api/admin/contest/reset
 *   POST   /api/contest/register
 *   GET    /api/admin/contest/registrations
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as XLSX from 'xlsx';
import { ContestSettingsDTO, ContestRegistrationDTO, RegisterUserPayload } from './contest.types';
import { ContestMapper } from './contest.mapper';
import { ContestStorage } from './contest.storage';
import { mockContestRegistrations } from '@/data/mockContestRegistrations';
import { apiClient } from '@/services/api/apiClient';

// ── Environment ───────────────────────────────────────────────────────────────
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
const CONTEST_BASE = '/api/contest';
const ADMIN_CONTEST_BASE = '/api/admin/contest';

// ── Simulate network delay (mock only) ────────────────────────────────────────
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────────────────────
// MOCK IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

const mockFetchSettings = async (): Promise<ContestSettingsDTO> => {
  await delay(300);
  const saved = ContestStorage.getSettings();
  if (saved) return saved;
  return { enabled: true, campaignVersion: 1, forceInteraction: false };
};

const mockUpdateSettings = async (
  settings: Partial<ContestSettingsDTO>
): Promise<ContestSettingsDTO> => {
  await delay(300);
  const current = await mockFetchSettings();
  const updated = { ...current, ...settings };
  ContestStorage.saveSettings(updated);
  return updated;
};

const mockResetCampaign = async (): Promise<ContestSettingsDTO> => {
  await delay(300);
  const current = await mockFetchSettings();
  current.campaignVersion += 1;
  ContestStorage.saveSettings(current);
  return current;
};

const mockFetchRegistrations = async (): Promise<ContestRegistrationDTO[]> => {
  await delay(400);
  const localData = ContestStorage.getRegistrations();
  const mergedMap = new Map<string, ContestRegistrationDTO>();
  mockContestRegistrations.forEach((reg) => mergedMap.set(reg.id, reg));
  localData.forEach((reg) => mergedMap.set(reg.id, reg));
  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

const mockRegisterUser = async (
  payload: RegisterUserPayload
): Promise<ContestRegistrationDTO> => {
  await delay(600);
  const dto = ContestMapper.toRegistrationDTO(payload);
  const currentLocalData = ContestStorage.getRegistrations();
  currentLocalData.push(dto);
  ContestStorage.saveRegistrations(currentLocalData);
  return dto;
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL API IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/contest/settings
 * Response: ContestSettingsDTO
 */
const realFetchSettings = async (): Promise<ContestSettingsDTO> => {
  return apiClient.get<ContestSettingsDTO>(`${ADMIN_CONTEST_BASE}/settings`);
};

/**
 * PUT /api/admin/contest/settings
 * Body:    Partial<ContestSettingsDTO>
 * Response: ContestSettingsDTO
 */
const realUpdateSettings = async (
  settings: Partial<ContestSettingsDTO>
): Promise<ContestSettingsDTO> => {
  return apiClient.put<ContestSettingsDTO>(`${ADMIN_CONTEST_BASE}/settings`, settings);
};

/**
 * POST /api/admin/contest/reset
 * Body:    {}
 * Response: ContestSettingsDTO  (with incremented campaignVersion)
 */
const realResetCampaign = async (): Promise<ContestSettingsDTO> => {
  return apiClient.post<ContestSettingsDTO>(`${ADMIN_CONTEST_BASE}/reset`, {});
};

/**
 * POST /api/contest/register
 * Body:    RegisterUserPayload
 * Response: ContestRegistrationDTO
 */
const realRegisterUser = async (
  payload: RegisterUserPayload
): Promise<ContestRegistrationDTO> => {
  return apiClient.post<ContestRegistrationDTO>(`${CONTEST_BASE}/register`, payload);
};

/**
 * GET /api/admin/contest/registrations?page=1&per_page=50&search=&country=
 * Response: { data: ContestRegistrationDTO[]; total: number; current_page: number; last_page: number }
 */
const realFetchRegistrations = async (): Promise<ContestRegistrationDTO[]> => {
  const res = await apiClient.get<{
    data: ContestRegistrationDTO[];
    total: number;
    current_page: number;
    last_page: number;
  }>(`${ADMIN_CONTEST_BASE}/registrations`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API CLASS  — consumers always call this
// ─────────────────────────────────────────────────────────────────────────────

export class ContestApi {
  /** Fetch popup settings (enabled, version, forceInteraction) */
  static fetchSettings = (): Promise<ContestSettingsDTO> =>
    USE_REAL_API ? realFetchSettings() : mockFetchSettings();

  /** Update popup settings */
  static updateSettings = (
    settings: Partial<ContestSettingsDTO>
  ): Promise<ContestSettingsDTO> =>
    USE_REAL_API ? realUpdateSettings(settings) : mockUpdateSettings(settings);

  /** Bump campaign version — forces popup to re-appear for all users */
  static resetCampaign = (): Promise<ContestSettingsDTO> =>
    USE_REAL_API ? realResetCampaign() : mockResetCampaign();

  /** Submit a user registration from the popup */
  static registerUser = (
    payload: RegisterUserPayload
  ): Promise<ContestRegistrationDTO> =>
    USE_REAL_API ? realRegisterUser(payload) : mockRegisterUser(payload);

  /** Fetch all registrations (admin dashboard) */
  static fetchRegistrations = (): Promise<ContestRegistrationDTO[]> =>
    USE_REAL_API ? realFetchRegistrations() : mockFetchRegistrations();

  /** Export registrations to .xlsx — always local (client-side) */
  static async exportRegistrationsToExcel(
    registrations: ContestRegistrationDTO[],
    version: number
  ): Promise<void> {
    const data = registrations.map((r) => ({
      'Full Name': r.name,
      'Phone Number': r.phone,
      Email: r.email,
      Country: r.country || '-',
      'Registration Date': new Date(r.date).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Contest-Registrations-v${version}-${dateStr}.xlsx`);
  }
}
