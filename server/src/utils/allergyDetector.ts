import { detectAllergyConflict } from "../shared";

export function checkMedicationSafety(medName: string, patientAllergies: string[]): { safe: boolean; conflictingAllergy?: string; warningMessage?: string } {
  const conflict = detectAllergyConflict(medName, patientAllergies);
  if (conflict) {
    return {
      safe: false,
      conflictingAllergy: conflict,
      warningMessage: `ALERT: Medication "${medName}" conflicts with patient's documented allergy to "${conflict}".`
    };
  }
  return { safe: true };
}
