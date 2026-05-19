import * as XLSX from "xlsx";
import { ContestSettingsDTO, ContestRegistrationDTO, RegisterUserPayload } from './contest.types';
import { ContestMapper } from './contest.mapper';
import { ContestStorage } from './contest.storage';
import { mockContestRegistrations } from '@/data/mockContestRegistrations';

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class ContestApi {
  
  static async fetchSettings(): Promise<ContestSettingsDTO> {
    await delay(300);
    const saved = ContestStorage.getSettings();
    if (saved) return saved;
    // Default settings if none saved
    return { enabled: true, campaignVersion: 1, forceInteraction: false };
  }

  static async updateSettings(settings: Partial<ContestSettingsDTO>): Promise<ContestSettingsDTO> {
    await delay(300);
    const current = await this.fetchSettings();
    const updated = { ...current, ...settings };
    ContestStorage.saveSettings(updated);
    return updated;
  }

  static async resetCampaign(): Promise<ContestSettingsDTO> {
    await delay(300);
    const current = await this.fetchSettings();
    current.campaignVersion += 1;
    ContestStorage.saveSettings(current);
    return current;
  }

  static async fetchRegistrations(): Promise<ContestRegistrationDTO[]> {
    await delay(400);
    // Merge mock data with local storage data
    const localData = ContestStorage.getRegistrations();
    
    // Create a map by ID to prevent duplicates (local overrides mock if same ID)
    const mergedMap = new Map<string, ContestRegistrationDTO>();
    mockContestRegistrations.forEach(reg => mergedMap.set(reg.id, reg));
    localData.forEach(reg => mergedMap.set(reg.id, reg));
    
    // Return sorted by date (newest first)
    return Array.from(mergedMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static async registerUser(payload: RegisterUserPayload): Promise<ContestRegistrationDTO> {
    await delay(600);
    const dto = ContestMapper.toRegistrationDTO(payload);
    
    // Fetch existing local data, append new, and save
    const currentLocalData = ContestStorage.getRegistrations();
    currentLocalData.push(dto);
    ContestStorage.saveRegistrations(currentLocalData);
    
    return dto;
  }

  static async exportRegistrationsToExcel(registrations: ContestRegistrationDTO[], version: number): Promise<void> {
    // Generate real Excel
    const data = registrations.map((r) => ({
      "Full Name": r.name,
      "Phone Number": r.phone,
      "Email": r.email,
      "Country": r.country || "-",
      "Registration Date": new Date(r.date).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Contest-Registrations-v${version}-${dateStr}.xlsx`);
  }
}
