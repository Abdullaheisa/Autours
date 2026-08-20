import { ContestRegistrationDTO, ContestSettingsDTO, RegisterUserPayload } from './contest.types';

export class ContestMapper {
  static toRegistrationDTO(payload: RegisterUserPayload): ContestRegistrationDTO {
    return {
      ...payload,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
  }

  static toDomain(dto: ContestRegistrationDTO) {
    return {
      ...dto,
      formattedDate: new Date(dto.date).toLocaleString(),
    };
  }
}
