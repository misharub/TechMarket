import { apiGet, apiPatch } from "./api";

export type HomeSlider = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  primaryText: string | null;
  primaryLabel: string | null;
  secondaryText: string | null;
  secondaryLabel: string | null;
  panelKicker: string;
  panelTitle: string;
  panelDescription: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HomeSliderPayload = {
  kicker: string;
  title: string;
  description: string;
  primaryText?: string | null;
  primaryLabel?: string | null;
  secondaryText?: string | null;
  secondaryLabel?: string | null;
  panelKicker: string;
  panelTitle: string;
  panelDescription: string;
  imageUrl?: string | null;
  isActive?: boolean;
};

export function getHomeSlider() {
  return apiGet<HomeSlider>("/home-slider");
}

export function getAdminHomeSlider() {
  return apiGet<HomeSlider>("/home-slider/admin");
}

export function updateHomeSlider(payload: HomeSliderPayload) {
  return apiPatch<HomeSlider, HomeSliderPayload>("/home-slider", payload);
}
