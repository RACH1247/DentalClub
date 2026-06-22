import PatientRecord from '../components/patient/PatientRecord';

/**
 * PatientsView — Dedicated full-page view for Patient Profiles.
 * Renders the full PatientRecord table with expanded detail cards.
 */
export default function PatientsView() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Profiles</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage and review patient records, allergies, and treatment histories.
        </p>
      </div>

      <PatientRecord />
    </div>
  );
}
