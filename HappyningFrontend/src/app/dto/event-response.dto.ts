import { Participant } from "./participant.dto";

export interface EventResponse {
    createdEvents: Event[];
    participantEvents: Participant[];
  }