import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Mother = {
  lat: number | null;
  lng: number | null;
  name: string;
};

type Visit = {
  uid: string;
  mothers: Mother[];
};

export async function getCurrentMotherLocation(motherId: string) {

  const { data: mother, error: motherError } = await supabase
    .from('mothers')
    .select('lat, lng')
    .eq('id', 'aa3eeb79-d522-42c9-8910-76d48644baae')
    .single();

  if (motherError || !mother) throw new Error('Mother location not found');

  return { lat: mother.lat, lng: mother.lng };
}

export async function getNearestVisitor(userLoc: { lat: number; lng: number }) {
  // Get all visits with visitor (mother) lat/lng
  const { data, error } = await supabase
    .from('visits')
    .select('uid, mothers!visits_uid_fkey1(lat, lng, name)')
    .eq('status', 'scheduled');

  if (error || !data) throw new Error('No visitors found');

  // Find nearest
  let minDist = Infinity;
  let nearest: { lat: number; lng: number; name: string } | null = null;
  for (const visit of data as Visit[]) {
    const visitor = Array.isArray(visit.mothers) ? visit.mothers[0] : visit.mothers;
    if (!visitor?.lat || !visitor?.lng) continue;
    const dist = Math.sqrt(
      Math.pow(visitor.lat - userLoc.lat, 2) + Math.pow(visitor.lng - userLoc.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = { lat: visitor.lat, lng: visitor.lng, name: visitor.name };
    }
  }
  return nearest;
}