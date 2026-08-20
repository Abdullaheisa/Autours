/** Specification `name` values expected by POST /filter/vehicles (matches backend DB). */
export const FILTER_SPEC_NAMES = {
  seats: 'Number of seats',
  doors: 'Doors',
  transmission: 'Transmission',
  fuelType: 'Fuel',
  suitcases: 'Suitcase',
  airConditioning: 'Air Conditioner',
} as const;
