// Party Planning Hooks Index
// Central export for all party planning related hooks

// VR Partners (B2B Customers)
export {
  vrPartnerKeys,
  useVRPartners,
  useVRPartner,
  useVRPartnerBySlug,
  useCreateVRPartner,
  useUpdateVRPartner,
  useDeleteVRPartner,
  useCheckSlugAvailability,
  generateSlug,
} from '../useVRPartners';

// Service Vendors (Supply Side)
export {
  vendorKeys,
  useServiceVendors,
  useServiceVendor,
  useServiceVendorBySlug,
  useVendorWithPackages,
  useVendorsByType,
  useCreateServiceVendor,
  useUpdateServiceVendor,
  useDeleteServiceVendor,
  useSearchVendors,
  generateVendorSlug,
} from '../useServiceVendors';

// Service Packages
export {
  packageKeys,
  useServicePackages,
  useServicePackage,
  usePackagesWithVendors,
  useCreateServicePackage,
  useUpdateServicePackage,
  useDeleteServicePackage,
  useReorderPackages,
  calculatePackagePricing,
} from '../useServicePackages';

// Parties (Core Entity)
export {
  partyKeys,
  useParties,
  useParty,
  usePartyWithDetails,
  usePartiesByPartner,
  usePartiesByOrganizer,
  useCreateParty,
  useUpdateParty,
  useUpdatePartyStatus,
  useDeleteParty,
  usePartyStats,
} from '../useParties';

// Party Bookings
export {
  bookingKeys,
  usePartyBookings,
  usePartyBooking,
  useBookingsByVendor,
  useCreatePartyBooking,
  useUpdatePartyBooking,
  useUpdateBookingStatus,
  useDeletePartyBooking,
  useCancelBooking,
  useBulkCreateBookings,
  generateConfirmationCode,
} from '../usePartyBookings';

// Party Guests
export {
  guestKeys,
  usePartyGuests,
  usePartyGuest,
  useGuestByEmail,
  useCreatePartyGuest,
  useBulkCreateGuests,
  useUpdatePartyGuest,
  useUpdateGuestRSVP,
  useUpdateGuestPayment,
  useDeletePartyGuest,
  useGuestStats,
  calculatePerGuestCost,
} from '../usePartyGuests';
