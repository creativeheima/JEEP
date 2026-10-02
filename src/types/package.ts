export interface TourPackage {
  id: string;
  badge: string;
  subBadge: string;
  title: string;
  price: string;
  duration: string;
  image: string;
  destinations: string[];
  isFeatured: boolean;
  featureText?: string;
  color: 'slate' | 'amber' | 'orange';
  order: number;
}