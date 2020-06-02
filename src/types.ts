export type ID = string
export type Time = number
export type State = any[]

export interface Snapshot {
  id: ID
  time: Time
  state: State
}
export interface InterpolatedSnapshot extends Omit<Snapshot, 'id' | 'time'> {
  percentage: number
  older: ID
  newer: ID
}