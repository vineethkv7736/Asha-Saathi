"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { getNearestVisitor, getCurrentMotherLocation } from "@/lib/mapService";

const containerStyle = {
  width: "100%",
  height: "60vh",
};

const defaultCenter = { lat: 9.459849, lng: 76.555256 };

export default function NearestVisitorMap({ motherId }: { motherId: string }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places", "geometry"],
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [visitor, setVisitor] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [route, setRoute] = useState<Array<{ lat: number; lng: number }>>([]);

  useEffect(() => {
    async function fetchLocations() {
      const userLoc = await getCurrentMotherLocation(motherId);
      setUserLocation(userLoc);
      const nearest = await getNearestVisitor(userLoc);
      setVisitor(nearest);
      // Optionally, fetch route polyline using Google Directions API
      if (userLoc && nearest) {
        const directions = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${userLoc.lat},${userLoc.lng}&destination=${nearest.lat},${nearest.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        ).then(res => res.json());
        if (directions.routes?.[0]?.overview_polyline?.points && window.google?.maps?.geometry?.encoding) {
          const points = window.google.maps.geometry.encoding.decodePath(
            directions.routes[0].overview_polyline.points
          );
          setRoute(points.map((p: any) => ({ lat: p.lat(), lng: p.lng() })));
        }
      }
    }
    fetchLocations();
  }, [motherId]);

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || defaultCenter}
      zoom={12}
    >
      {userLocation && (
        <Marker position={userLocation} label="You" />
      )}
      {visitor && (
        <Marker position={visitor} label={visitor.name} />
      )}
      {route.length > 0 && (
        <Polyline path={route} options={{ strokeColor: "blue", strokeWeight: 4 }} />
      )}
    </GoogleMap>
  );
}