import { ServiceType } from "@repo/database";

export const ServiceTypeDisplayMap: Record<string, ServiceType> = {
  Windshield: ServiceType.Windshield,
  "Door Glass": ServiceType.DoorGlass,
  "Back Glass": ServiceType.BackGlass,
  Sunroof: ServiceType.Sunroof,
  Mirror: ServiceType.Mirror,
  "Quarter Glass": ServiceType.QuarterGlass,
  "Chip Subscription": ServiceType.ChipSubscription,
  Warranty: ServiceType.Warranty,
};
