import terrainAerial from "@/assets/terrain-aerial.jpg";
import terrainAlt from "@/assets/terrain-alt.jpg";

export type ProjectStatus = "Completed" | "Processing" | "Ready";

export const projects: {
  id: string;
  name: string;
  location: string;
  date: string;
  elevation: string;
  area: string;
  status: ProjectStatus;
  image: string;
}[] = [
  { id: "1", name: "Himalayan Ridge Survey", location: "Uttarakhand, India", date: "24 Sep 2026", elevation: "4,218 m", area: "12.8 km²", status: "Completed", image: terrainAerial },
  { id: "2", name: "Alpine Valley Mapping", location: "Himachal Pradesh, India", date: "18 Sep 2026", elevation: "3,642 m", area: "8.4 km²", status: "Completed", image: terrainAlt },
  { id: "3", name: "Western Ghats Analysis", location: "Maharashtra, India", date: "12 Sep 2026", elevation: "1,386 m", area: "16.2 km²", status: "Completed", image: terrainAerial },
  { id: "4", name: "Deccan Plateau Scan", location: "Karnataka, India", date: "29 Sep 2026", elevation: "892 m", area: "21.5 km²", status: "Processing", image: terrainAlt },
  { id: "5", name: "Coastal Dune Survey", location: "Kerala, India", date: "30 Sep 2026", elevation: "146 m", area: "6.1 km²", status: "Ready", image: terrainAerial },
];

export { terrainAerial, terrainAlt };
