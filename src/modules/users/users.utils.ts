import {
  UpdatesDoctorProfileDto,
  UpdatesPatientProfileDto,
} from './dtos/index.js';

export const isPatientProfile = (
  changes: UpdatesDoctorProfileDto | UpdatesPatientProfileDto,
): changes is UpdatesPatientProfileDto => {
  return 'dateOfBirth' in changes || 'diabetesType' in changes;
};

export const isDoctorProfile = (
  changes: UpdatesDoctorProfileDto | UpdatesPatientProfileDto,
): changes is UpdatesDoctorProfileDto => {
  return 'specialty' in changes;
};
