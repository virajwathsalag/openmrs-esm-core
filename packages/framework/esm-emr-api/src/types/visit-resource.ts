import { type OpenmrsResource, type Location } from "@openmrs/esm-api";

export interface NewVisitPayload {
  uuid?: string;
  location: string;
  patient?: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime?: Date;
  attributes?: Array<{
    attributeType: string;
    value: string;
  }>;
}

export type UpdateVisitPayload = NewVisitPayload & {};

export interface Visit {
  uuid: string;
  display?: string;
  encounters: Array<OpenmrsResource>;
  patient?: OpenmrsResource;
  visitType: VisitType;
  location?: Location;
  startDatetime: string;
  stopDatetime?: string;
  attributes?: Array<OpenmrsResource>;
  [anythingElse: string]: any;
}

export interface VisitType {
  uuid: string;
  display: string;
  name?: string;
}
