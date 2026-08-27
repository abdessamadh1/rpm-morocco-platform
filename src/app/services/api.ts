import { Patient, LoggedUser, MedRecord, StaffMember, Appointment } from "../shared";

const API_BASE = "http://localhost:5000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("rpm_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `API request failed with status ${res.status}`);
  }

  return json.data;
}

export const api = {
  // Auth
  async login(username: string, pass: string): Promise<{ token: string; user: LoggedUser }> {
    const data = await request<{ token: string; user: LoggedUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password: pass }),
    });
    localStorage.setItem("rpm_token", data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("rpm_token");
    }
  },

  async getMe(): Promise<LoggedUser> {
    const data = await request<{ user: LoggedUser }>("/auth/me");
    return data.user;
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    return request<Patient[]>("/patients");
  },

  async updateThresholds(id: string, spo2: number, hrHigh: number): Promise<Patient> {
    return request<Patient>(`/patients/${id}/thresholds`, {
      method: "PUT",
      body: JSON.stringify({ spo2, hrHigh }),
    });
  },

  async acknowledgeAlert(id: string): Promise<Patient> {
    return request<Patient>(`/patients/${id}/acknowledge`, {
      method: "POST",
    });
  },

  async addPatient(form: any): Promise<{ patient: Patient; record: MedRecord }> {
    return request<{ patient: Patient; record: MedRecord }>("/patients", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },

  // Staff
  async getStaff(): Promise<StaffMember[]> {
    return request<StaffMember[]>("/staff");
  },

  async updateStaffStatus(id: string, status: string, statusNote: string): Promise<StaffMember> {
    return request<StaffMember>(`/staff/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, statusNote }),
    });
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return request<Appointment[]>("/appointments");
  },

  async createAppointment(appt: Partial<Appointment>): Promise<Appointment> {
    return request<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(appt),
    });
  },

  // Records
  async getMedRecord(patientId: string): Promise<MedRecord> {
    return request<MedRecord>(`/records/${patientId}`);
  },

  async addClinicalNote(patientId: string, text: string, tags: string[]): Promise<any> {
    return request(`/records/${patientId}/notes`, {
      method: "POST",
      body: JSON.stringify({ text, tags }),
    });
  },

  async addChatMessage(patientId: string, text: string): Promise<any> {
    return request(`/records/${patientId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  async checkMedication(patientId: string, medName: string): Promise<{ safe: boolean; conflictingAllergy?: string; warningMessage?: string }> {
    return request<{ safe: boolean; conflictingAllergy?: string; warningMessage?: string }>(`/records/${patientId}/check-medication`, {
      method: "POST",
      body: JSON.stringify({ medName }),
    });
  },

  // Telemetry SSE Stream
  subscribeTelemetryStream(onData: (data: any) => void, onError?: (err: any) => void): () => void {
    const es = new EventSource(`${API_BASE}/telemetry/stream`);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onData(parsed);
      } catch (err) {
        if (onError) onError(err);
      }
    };
    es.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => es.close();
  }
};
