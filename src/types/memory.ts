export type PermanentIdentity = {
  name: string | null;
  gender: string | null;
  core_identity: string | null;
};

export type MemoryState = {
  story_summary: string;
  user_facts: string[];
  relationship_state: string;
  emotional_state: string;
  open_threads: string[];
  important_promises: string[];
  important_events: string[];
  permanent_identity?: PermanentIdentity;
};
