"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
export interface MapItem {
  id: string;
  title: string;
  price?: string;
  type: "sell" | "swap";
  location: string;
  distance: string;
  image: string;
  seller: { id?: string; name: string; username?: string; avatar: string };
  lat: number;
  lng: number;
  computedKm?: number | null;
}

interface Props {
  items: MapItem[];
  selectedItem: string | null;
  onSelectItem: (id: string | null) => void;
  userLocation: [number, number] | null;
  searchCenter?: [number, number] | null;
}

function FlyToLocation({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 14, { animate: true, duration: 1.2 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);
  return null;
}

function FlyToSearch({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 14, { animate: true, duration: 1.2 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);
  return null;
}

function createAvatarIcon(item: MapItem, selected: boolean) {
  const color = item.type === "swap" ? "#8127cf" : "#0058be";
  const typeIcon = item.type === "swap" ? "sync_alt" : "sell";
  const size = selected ? 52 : 44;
  const badge = selected ? 22 : 18;
  const half = size / 2;

  const avatar = item.seller.avatar
    ? `<img src="${item.seller.avatar}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block;" />`
    : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-size:${Math.round(size * 0.38)}px;font-weight:700;">${item.seller.name.charAt(0)}</div>`;

  const ring = selected
    ? `0 0 0 3px white, 0 4px 18px rgba(0,0,0,0.28)`
    : `0 2px 10px rgba(0,0,0,0.2)`;

  return L.divIcon({
    className: "sf-marker",
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="border-radius:50%;border:2.5px solid ${color};box-shadow:${ring};overflow:hidden;width:${size}px;height:${size}px;">
        ${avatar}
      </div>
      <div style="position:absolute;bottom:-2px;right:-2px;width:${badge}px;height:${badge}px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;">
        <span class="material-symbols-outlined" style="color:white;font-size:${Math.round(badge * 0.65)}px;line-height:1;">${typeIcon}</span>
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 8)],
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "sf-marker",
    html: `<div class="sf-user-location">
      <div class="sf-user-pulse"></div>
      <div class="sf-user-dot"></div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: "sf-marker",
    html: `<div class="sf-cluster-icon">${count}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export default function MapClient({ items, selectedItem, onSelectItem, userLocation, searchCenter }: Props) {
  const center: [number, number] = userLocation ?? searchCenter ?? [47.6200, -122.3400];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {userLocation && <FlyToLocation position={userLocation} />}
      {searchCenter && <FlyToSearch position={searchCenter} />}

      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={2000}
            pathOptions={{
              color: "#0058be",
              fillColor: "#0058be",
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: "6 4",
            }}
          />
          <Marker position={userLocation} icon={createUserLocationIcon()} />
        </>
      )}

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        showCoverageOnHover={false}
        maxClusterRadius={60}
      >
        {items.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createAvatarIcon(item, item.id === selectedItem)}
            eventHandlers={{
              click: () => onSelectItem(item.id === selectedItem ? null : item.id),
            }}
          >
            <Popup closeButton={false} className="sf-popup">
              <div style={{ display: "flex", gap: "10px", width: "200px" }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#191c1e", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                    {item.seller.avatar && (
                      <img src={item.seller.avatar} alt={item.seller.name} style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />
                    )}
                    <span style={{ fontSize: 11, color: "#424754", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.seller.name} · {item.location}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: item.type === "swap" ? "#f0dbff" : "#d8e2ff",
                    color: item.type === "swap" ? "#8127cf" : "#0058be",
                  }}>
                    {item.type === "sell" ? (item.price ?? "For Sale") : "Swap"}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

