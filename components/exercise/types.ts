
export type SessionSet = {
  weight: string;
  reps: string;
  rir: string;
  completed: boolean;
};

export type SessionState = {
  sessionDate: string;
  perceivedEffort: string;
  notes: string;
  mediaImage: string;
  mediaVideo: string;
  sets: SessionSet[];
};
