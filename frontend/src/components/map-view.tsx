import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapViewProps = {
  imageData?: string | null;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
};

type Position = {
  lat: number;
  lng: number;
};

const streetLayer = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

const satelliteLayer = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri",
};

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;
    background:#a3e635;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 10px #000;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapController({ position }: { position: Position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 14), {
      duration: 1.2,
    });
  }, [position, map]);

  return null;
}

function MapClickPicker({
  onPick,
}: {
  onPick: (position: Position) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

export function MapView({
  imageData = null,
  onLocationChange,
}: MapViewProps) {
  const [layer, setLayer] = useState<"street" | "satellite">("satellite");
  const [position, setPosition] = useState<Position>({
    lat: 17.385,
    lng: 78.4867,
  });
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  function selectPosition(next: Position) {
    setPosition(next);
    onLocationChange?.(next);
  }

  async function searchLocation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!search.trim()) return;

    setSearching(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(search)}`
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const results = await response.json();

      if (!results.length) {
        throw new Error("Location not found. Try another search.");
      }

      selectPosition({
        lat: Number(results[0].lat),
        lng: Number(results[0].lon),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to search location."
      );
    } finally {
      setSearching(false);
    }
  }

  const activeLayer =
    layer === "satellite" ? satelliteLayer : streetLayer;

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-border bg-card">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        minZoom={2}
        maxZoom={19}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          key={layer}
          url={activeLayer.url}
          attribution={activeLayer.attribution}
          maxZoom={19}
        />

        <Marker
          position={[position.lat, position.lng]}
          icon={markerIcon}
        >
          <Popup>
            <strong>Selected exploration location</strong>
            <br />
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </Popup>
        </Marker>

        <MapController position={position} />
        <MapClickPicker onPick={selectPosition} />
      </MapContainer>

      <form
        onSubmit={searchLocation}
        className="absolute left-3 right-3 top-3 z-[1000] flex gap-2 sm:right-auto sm:w-[390px]"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search any place in the world..."
          className="min-w-0 flex-1 rounded-md border border-white/20 bg-black/85 px-3 py-3 text-sm text-white outline-none placeholder:text-white/60 focus:border-lime-400"
        />

        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="absolute left-3 right-3 top-[66px] z-[1000] rounded-md bg-red-950/90 p-2 text-xs text-white sm:right-auto sm:max-w-[390px]">
          {error}
        </div>
      )}

      <div className="absolute right-3 top-[75px] z-[1000] flex flex-col gap-2 sm:top-3">
        <button
          type="button"
          onClick={() => setLayer("satellite")}
          className={`rounded-md px-3 py-2 text-xs font-bold shadow ${
            layer === "satellite"
              ? "bg-lime-400 text-black"
              : "bg-black/85 text-white"
          }`}
        >
          Satellite
        </button>

        <button
          type="button"
          onClick={() => setLayer("street")}
          className={`rounded-md px-3 py-2 text-xs font-bold shadow ${
            layer === "street"
              ? "bg-lime-400 text-black"
              : "bg-black/85 text-white"
          }`}
        >
          Street map
        </button>
      </div>

      {imageData && (
        <div className="absolute bottom-3 right-3 z-[1000] w-36 overflow-hidden rounded-lg border border-white/30 bg-black/90 shadow-xl sm:w-48">
          <img
            src={imageData}
            alt="Your uploaded satellite image"
            className="h-24 w-full object-cover sm:h-28"
          />
          <p className="px-2 py-2 text-[10px] font-semibold text-white">
            Your uploaded image
          </p>
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-[1000] max-w-[65%] rounded-md bg-black/80 px-3 py-2 text-[10px] text-white">
        Click anywhere on the map to select a location
      </div>
    </div>
  );
}
