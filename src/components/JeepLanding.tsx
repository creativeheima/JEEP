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
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import CheckTicketModal from '@/components/CheckTicketModal';
import MarqueeStrip from '@/components/MarqueeStrip';
import { ScrollProgress } from '@/components/motion';
import JourneyRail from '@/components/JourneyRail';
import TrailPath from '@/components/TrailPath';
import MountainDivider from '@/components/MountainDivider';


export default function JeepLanding() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [checkTicketOpen, setCheckTicketOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('Paket Medium');

  const handleOpenBooking = (packageName?: string) => {
    if (packageName) {
      setSelectedPackage(packageName);
    }
    setBookingOpen(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-sand selection:bg-amber-500 selection:text-white">
      {/* Kanvas latar menyatu (aurora) + tekstur grain */}
      <div className="page-canvas" aria-hidden="true">
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="aurora aurora-c" />
      </div>
      <div className="grain" aria-hidden="true" />

      {/* Rel bab perjalanan (layar lebar) */}
      <JourneyRail />

      {/* Progres scroll di paling atas */}
      <ScrollProgress />

      {/* Navigation Bar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenCheckTicket={() => setCheckTicketOpen(true)}
      />

      {/* Main Content Sections (1 to 10 matching Figma) */}
      <main className="relative z-10 flex-1">
        {/* Jejak rute berkelok di belakang semua section */}
        <TrailPath />

        {/* Section 1: Hero Section */}
        <HeroSection onOpenBooking={() => handleOpenBooking()} />

        {/* Pita teks berjalan */}
        <MarqueeStrip />

        {/* Section 2: Editorial Collage */}
        <CollageSection onOpenBooking={() => handleOpenBooking()} />

        <MountainDivider variant={0} flip={false} />

        {/* Section 3: Pilihan Paket Wisata */}
        <PackagesSection
          onSelectPackage={(pkgName) => handleOpenBooking(pkgName)}
        />

        <MountainDivider variant={1} flip={true} />

        {/* Section 4: Petualangan Sinematik ("Rasakan Petualangannya") */}
        <CinematicStatsSection />

        <MountainDivider variant={0} flip={false} />

        {/* Section 5: Destinasi Spot Ikonik */}
        <DestinationsSection
          onSelectDestination={() => handleOpenBooking()}
        />

        <MountainDivider variant={1} flip={true} />

        {/* Section 6: Wisatawan / Traveler Experience */}
        <ExperienceSection />

        <MountainDivider variant={0} flip={false} />

        {/* Section 7: Fasilitas Standar Layanan */}
        <FacilitiesSection />

        <MountainDivider variant={1} flip={true} />

        {/* Section 8: Galeri Foto */}
        <GallerySection />

        <MountainDivider variant={0} flip={false} />

        {/* Section 9: Testimoni Pengunjung */}
        <TestimonialsSection />

        <MountainDivider variant={1} flip={true} />

        {/* FAQ — juga untuk SEO */}
        <FaqSection />

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

      {/* Check Ticket Modal */}
      <CheckTicketModal
        isOpen={checkTicketOpen}
        onClose={() => setCheckTicketOpen(false)}
      />
    </div>
  );
}
