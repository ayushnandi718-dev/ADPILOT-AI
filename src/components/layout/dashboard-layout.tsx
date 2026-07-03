"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { OnboardingTour, useOnboardingTour } from "@/components/tour/onboarding-tour";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tour = useOnboardingTour();

  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar onStartTour={tour.startTour} />
      <main className="flex-1 lg:ml-[240px] ml-0">
        <Header />
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <OnboardingTour
        isOpen={tour.isOpen}
        currentStep={tour.currentStep}
        setCurrentStep={tour.setCurrentStep}
        completeTour={tour.completeTour}
        dismissTour={tour.dismissTour}
        totalSteps={tour.totalSteps}
      />
    </div>
  );
}
