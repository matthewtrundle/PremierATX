// Partner Routes
// Handles routing within a VR Partner storefront context

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { VRPartnerProvider } from '@/contexts/VRPartnerContext';
import { PartnerStorefront } from '@/pages/partner/PartnerStorefront';
import { VendorBrowser } from '@/components/vendor/VendorBrowser';
import { VendorProfile } from '@/components/vendor/VendorProfile';
import { PartyCreationWizard } from '@/components/party/PartyCreationWizard';
import { PartyHub } from '@/components/party/PartyHub';
import { MyParties } from '@/components/party/MyParties';
import { CartPage } from '@/components/cart/MultiVendorCart';

interface PartnerRoutesProps {
  partnerSlug?: string;
}

export function PartnerRoutes({ partnerSlug }: PartnerRoutesProps) {
  return (
    <VRPartnerProvider overrideSlug={partnerSlug}>
      <Routes>
        {/* Partner Home */}
        <Route index element={<PartnerStorefront />} />

        {/* Browse Vendors */}
        <Route path="vendors" element={<VendorBrowser />} />
        <Route path="vendors/:type" element={<VendorBrowser />} />
        <Route path="vendor/:vendorSlug" element={<VendorProfile />} />

        {/* Party Planning */}
        <Route path="plan" element={<PartyCreationWizard />} />
        <Route path="plan/:step" element={<PartyCreationWizard />} />

        {/* Cart & Checkout */}
        <Route path="cart" element={<CartPage />} />

        {/* Party Management */}
        <Route path="party/:partyId" element={<PartyHub />} />
        <Route path="my-parties" element={<MyParties />} />

        {/* Checkout (inherits from main app) */}
        {/* Will redirect to main checkout with party context */}

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </VRPartnerProvider>
  );
}

export default PartnerRoutes;
