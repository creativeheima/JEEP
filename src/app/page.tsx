import JeepLanding from '@/components/JeepLanding';
import { defaultPackagesData } from '@/lib/defaultPackages';
import { SITE, FAQS } from '@/lib/site';

/** Structured data (JSON-LD) agar Google memahami bisnis, paket & FAQ. */
function StructuredData() {
  const business = {
    '@type': ['TravelAgency', 'LocalBusiness'],
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}${SITE.ogImage}`,
    logo: `${SITE.url}/images/logo.png`,
    description: SITE.description,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: SITE.priceRange,
    currenciesAccepted: 'IDR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    areaServed: [
      { '@type': 'City', name: 'Yogyakarta' },
      { '@type': 'AdministrativeArea', name: 'Sleman' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: SITE.openingHours.opens,
        closes: SITE.openingHours.closes,
      },
    ],
    sameAs: SITE.socials,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      contactType: 'reservations',
      availableLanguage: ['Indonesian', 'English'],
    },
  };

  const trips = defaultPackagesData.map((p) => ({
    '@type': 'TouristTrip',
    name: `${p.title} – Lava Tour Jeep Merapi`,
    description: `Durasi ${p.duration}. Rute: ${p.destinations.join(', ')}.`,
    image: `${SITE.url}${p.image}`,
    touristType: ['Keluarga', 'Rombongan', 'Wisatawan petualang'],
    itinerary: {
      '@type': 'ItemList',
      itemListElement: p.destinations.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d })),
    },
    provider: { '@id': `${SITE.url}/#business` },
    offers: {
      '@type': 'Offer',
      price: p.price.replace(/[^\d]/g, ''),
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/#paket-wisata`,
      description: 'Harga per jeep, maksimal 4 orang dewasa',
    },
  }));

  const faq = {
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'id-ID',
    publisher: { '@id': `${SITE.url}/#business` },
  };

  const graph = { '@context': 'https://schema.org', '@graph': [website, business, ...trips, faq] };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <JeepLanding />
    </>
  );
}
