import { useState, useCallback, useEffect } from 'react';
import AddPatientForm from '../components/patient/AddPatientForm';
import PatientProfilesTable from '../components/patient/PatientProfilesTable';
import {
  fetchPatientsFromStorage,
  addPatientToStorage,
  removePatientFromStorage,
} from '../services/patientService';

/**
 * PatientsView — Full-page patient management view.
 *
 * Renders:
 *   1. AddPatientForm          — Clinical intake form for new patients
 *   2. PatientProfilesTable    — Unified searchable table (seed + new patients)
 *
 * The unified patient array is loaded from localStorage via the
 * patientService module. Newly added patients are appended and
 * instantly visible in the same table alongside seed data.
 *
 * ┌─────────────────────────────────────────────┐
 * │  BACKEND SWAP:                              │
 * │  The patientService functions are drop-in   │
 * │  replaceable with Axios calls. No changes   │
 * │  needed in this file.                       │
 * └─────────────────────────────────────────────┘
 */
export default function PatientsView() {
  /* ── Unified patient array (localStorage-backed) ──── */
  const [patients, setPatients] = useState(() => fetchPatientsFromStorage());

  /**
   * Re-sync state from localStorage when this view mounts.
   * Covers the case where another component (e.g. charting flow)
   * modifies the shared storage while this view was unmounted.
   */
  useEffect(() => {
    setPatients(fetchPatientsFromStorage());
  }, []);

  /**
   * savePatient — Persists a new patient to localStorage and updates
   * the local React state in one atomic operation.
   *
   * ┌───────────────────────────────────────────────────┐
   * │  BACKEND SWAP:                                    │
   * │  When patientService switches to Axios, this      │
   * │  callback will automatically use the network      │
   * │  version of addPatientToStorage. No edits needed. │
   * └───────────────────────────────────────────────────┘
   */
  const savePatient = useCallback(async (patientData) => {
    // Simulate slight network latency for realistic UX feedback
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Parse comma-separated allergies into an array
    const parsedAllergies = patientData.allergies
      ? patientData.allergies.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    // Baseline teeth status — all 32 teeth Healthy
    const baselineTeethStatus = {};
    for (let i = 1; i <= 32; i++) {
      baselineTeethStatus[i] = 'Healthy';
    }

    // Baseline perio data — healthy pocket depths, zero bleeding, zero recession
    const baselinePerioData = {};
    for (let i = 1; i <= 32; i++) {
      baselinePerioData[i] = {
        pocketDepth: [2, 2, 2],   // mesial, mid, distal — healthy baseline
        bop: [0, 0, 0],           // no bleeding on probing
        recession: 0,             // no gum recession
      };
    }

    // Enrich with fields expected by the unified table
    const enriched = {
      ...patientData,
      name: patientData.fullName,
      phone: patientData.contactNumber,
      lastVisit: patientData.createdAt,
      nextAppointment: null,
      concerns: patientData.clinicalNotes?.split(',')[0]?.trim() || 'General consultation',
      allergies: parsedAllergies,
      treatments: [],
      insuranceProvider: null,
      bloodGroup: patientData.bloodGroup || null,
      rollNo: null,
      initials: patientData.fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      teethState: baselineTeethStatus,
      perioChart: baselinePerioData,
    };

    const updated = addPatientToStorage(enriched);
    setPatients(updated);
    return enriched;
  }, []);

  /**
   * removePatient — Removes a patient by ID from localStorage and
   * updates React state.
   *
   * ┌───────────────────────────────────────────────────┐
   * │  BACKEND SWAP:                                    │
   * │  Will use DELETE /api/patients/:id automatically  │
   * │  once patientService is swapped.                  │
   * └───────────────────────────────────────────────────┘
   */
  const removePatient = useCallback((patientId) => {
    const updated = removePatientFromStorage(patientId);
    setPatients(updated);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ───────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Profiles</h1>
        <p className="text-sm text-slate-400 mt-1">
          Register new patients, manage records, and review treatment histories.
        </p>
      </div>

      {/* ── Add New Patient Form ──────────────── */}
      <AddPatientForm onSavePatient={savePatient} />

      {/* ── Unified Patient Profiles Table ─────── */}
      <PatientProfilesTable
        patients={patients}
        onRemovePatient={removePatient}
      />
    </div>
  );
}
