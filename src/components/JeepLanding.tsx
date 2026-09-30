'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CollageSection from '@/components/CollageSection';
import PackagesSection from '@/components/PackagesSection';
import CinematicStatsSection from '@/components/CinematicStatsSection';
import DestinationsSection from '@/components/DestinationsSection';
import ExperienceSection from '@/components/ExperienceSection';
import FacilitiesSection from '@/components/FacilitiesSection';
import GallerySection from '@/components/GallerySection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';

export default function JeepLanding() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('Paket Medium');

  const handleOpenBooking = (packageName?: string) => {
    if (packageName) {
      setSelectedPackage(packageName);
    }
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-amber-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar onOpenBooking={() => handleOpenBooking()} />

      {/* Main Content Sections (1 to 10 matching Figma) */}
      <main className="flex-1">
        {/* Section 1: Hero Section */}
        <HeroSection onOpenBooking={() => handleOpenBooking()} />

        {/* Section 2: Editorial Collage */}
        <CollageSection onOpenBooking={() => handleOpenBooking()} />

        {/* Section 3: Pilihan Paket Wisata */}
        <PackagesSection
          onSelectPackage={(pkgName) => handleOpenBooking(pkgName)}
        />

        {/* Section 4: Petualangan Sinematik ("Rasakan Petualangannya") */}
        <CinematicStatsSection />

        {/* Section 5: Destinasi Spot Ikonik */}
        <DestinationsSection
          onSelectDestination={() => handleOpenBooking()}
        />

        {/* Section 6: Wisatawan / Traveler Experience */}
        <ExperienceSection />

        {/* Section 7: Fasilitas Standar Layanan */}
        <FacilitiesSection />

        {/* Section 8: Galeri Foto */}
        <GallerySection />

        {/* Section 9: Testimoni Pengunjung */}
        <TestimonialsSection />

        {/* Section 10: Giant Closing CTA */}
        <CtaSection onOpenBooking={() => handleOpenBooking()} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialPackage={selectedPackage}
      />
    </div>
  );
}
