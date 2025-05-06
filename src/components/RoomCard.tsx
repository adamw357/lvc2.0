import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import { RoomRate } from '@/types/hotel'; // Import the shared type
import { UserGroupIcon, NoSymbolIcon } from '@heroicons/react/24/outline'; // Keep UserGroupIcon and NoSymbolIcon
import { Bed, Cigarette } from 'lucide-react'; // Import Bed icon from Lucide and Cigarette icon

interface RoomCardProps {
  room: RoomRate;
  currency?: string | null; // Pass currency from parent
  onSelectRoom: (room: RoomRate) => void; // Pass handler function
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, currency, onSelectRoom }) => {
  const [isAmenitiesExpanded, setIsAmenitiesExpanded] = useState(false);
  // Add state for selected rate option
  const [selectedRateIdx, setSelectedRateIdx] = useState(0);
  // Add state for selected extra (board basis)
  const [selectedExtraIdx, setSelectedExtraIdx] = useState(0);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isPolicyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPolicyOpen]);

  // Extract data from room prop
  const roomImageUrl = room.images?.[0]?.links?.[1]?.url || room.images?.[0]?.links?.[0]?.url;
  const rateOptions = room.extra || [];
  const selectedRate = rateOptions[selectedRateIdx] || {};
  // Find all unique boardBasis options for this rate
  const extras = rateOptions.filter(r => r.refundable === selectedRate.refundable);
  const selectedExtra = extras[selectedExtraIdx] || selectedRate;
  const roomPriceInfo = selectedExtra.price;
  const pricePerNight = roomPriceInfo?.perNightStay;
  const totalPrice = roomPriceInfo?.total;
  const taxAndFees = roomPriceInfo?.TaxAndExtras;
  const displayPrice = typeof pricePerNight === 'number' ? pricePerNight : (typeof totalPrice === 'number' ? totalPrice : undefined);
  const priceLabel = typeof pricePerNight === 'number' ? ' / night' : (typeof totalPrice === 'number' ? ' total' : '');
  const amenities = room.roomAmenities || [];
  const amenitiesToShow = isAmenitiesExpanded ? amenities : amenities.slice(0, 6);

  // --- Smoking Preference Logic ---
  let smokingPref: 'non-smoking' | 'smoking' | null = null;
  const lowerCaseAmenities = amenities.map(a => a.toLowerCase());
  if (lowerCaseAmenities.includes('non-smoking')) {
    smokingPref = 'non-smoking';
  } else if (lowerCaseAmenities.includes('smoking')) { // Check for explicit smoking allowed
    smokingPref = 'smoking';
  }
  // --- End Smoking Logic ---

  // Skip rendering if no image (as decided before)
  if (!roomImageUrl) {
    return null;
  }

  const toggleAmenities = () => {
    setIsAmenitiesExpanded(!isAmenitiesExpanded);
  };

  // Helper to get label for rate option
  const getRateLabel = (rate: any) =>
    rate.refundable === true ? 'Refundable' : 'Non-refundable';

  // Helper to get label for extras
  const getExtraLabel = (extra: any) => extra.boardBasis || 'Room Only';

  // When rate changes, reset extra selection
  React.useEffect(() => {
    setSelectedExtraIdx(0);
  }, [selectedRateIdx]);

  // Helper to parse and render policy details (final cleanup for rules)
  const renderPolicyDetails = () => {
    const cancellationPolicies = selectedExtra.cancellationPolicies || [];
    const policies = selectedExtra.policies || [];
    // Helper to bold key terms
    const boldKeyTerms = (text: string) => {
      if (!text) return '';
      return text
        .replace(/(Refundable|Non-refundable|Deposit|Check-in|Check-out|Mandatory Fee|Optional Fee|Special Check-in Instruction|Know Before You Go|Resort fee|Cancellation Policy|Other Policies)/gi, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
    };
    // Helper to render a block of text as paragraphs
    const renderParagraphs = (text: string) => {
      return text.split(/\n+/).map((line, idx) => (
        <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: boldKeyTerms(line) }} />
      ));
    };
    // Helper to render rules array in a human-readable way
    const renderRules = (rules: any[]) => {
      if (!Array.isArray(rules) || rules.length === 0) return null;
      return (
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2">
          {rules.map((rule, idx) => {
            // Try to format the rule in a user-friendly way
            let text = '';
            if (rule.value === 0) {
              text = `Free cancellation until ${rule.end ? new Date(rule.end).toLocaleString() : ''}`;
            } else if (rule.value > 0) {
              text = `${rule.value} night penalty after ${rule.start ? new Date(rule.start).toLocaleString() : ''}`;
            } else {
              text = JSON.stringify(rule);
            }
            return <li key={idx}>{text}</li>;
          })}
        </ul>
      );
    };
    // Helper to render structured policy objects
    const renderStructuredPolicies = (policyArr: any[]) => (
      <>
        {policyArr.map((policy: any, idx: number) => {
          // If policy is an object with type/text, render as section
          if (policy.type && policy.text) {
            return (
              <div key={idx} className="mb-6">
                <div className="font-semibold text-gray-800 mb-2">{policy.type}</div>
                {renderParagraphs(policy.text)}
                <hr className="my-4 border-gray-300" />
              </div>
            );
          }
          // If policy has a rules array, render it nicely
          if (policy.rules && Array.isArray(policy.rules)) {
            return (
              <div key={idx} className="mb-6">
                <div className="font-semibold text-gray-800 mb-2">Cancellation Rules</div>
                {renderRules(policy.rules)}
                <hr className="my-4 border-gray-300" />
              </div>
            );
          }
          // Otherwise, fallback to previous rendering
          return (
            <div key={idx} className="mb-6">
              {renderParagraphs(policy.description || policy.policyDescription || '')}
              <hr className="my-4 border-gray-300" />
            </div>
          );
        })}
      </>
    );
    return (
      <div className="max-w-lg p-6 bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-bold mb-4">Policies</h2>
        {cancellationPolicies.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold mb-2 text-gray-800 border-b pb-1">Cancellation Policy</div>
            {renderStructuredPolicies(cancellationPolicies)}
          </div>
        )}
        {policies.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold mb-2 text-gray-800 border-b pb-1">Other Policies</div>
            {renderStructuredPolicies(policies)}
          </div>
        )}
        {cancellationPolicies.length === 0 && policies.length === 0 && (
          <p className="text-gray-500 text-sm">No policy details available for this rate.</p>
        )}
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setIsPolicyOpen(false)}
        >
          Close
        </button>
      </div>
    );
  };

  // Policy Modal (using React Portal)
  const PolicyModal = () => {
    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        onClick={() => setIsPolicyOpen(false)}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="relative"
          onClick={e => e.stopPropagation()}
          tabIndex={0}
          role="document"
        >
          {renderPolicyDetails()}
        </div>
      </div>
    );
    if (typeof window !== 'undefined') {
      return ReactDOM.createPortal(modalContent, document.body);
    }
    return null;
  };

  return (
    <div 
      key={room.rateId || room.groupId || room.roomId} 
      className="border p-8 rounded-3xl shadow-lg bg-white flex flex-col transition-transform duration-200 hover:shadow-2xl hover:scale-[1.03] overflow-hidden max-w-xl mx-auto mb-8"
    > 
      {/* Room Image Area */}
      <div className="relative aspect-video mb-5 -mx-8 -mt-8 rounded-2xl overflow-hidden"> 
        <Image
          src={roomImageUrl}
          alt={room.name || 'Room image'}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
        />
      </div>
      
      {/* Room Name and Refundable Badge */}
      <div className="flex items-center mb-2">
        <h4 className="font-semibold text-2xl mr-2">{room.name || 'Room Information'}</h4>
        {selectedRate.refundable === true && (
          <span
            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ml-1"
            title="This room can be cancelled for a full refund"
          >
            Refundable
          </span>
        )}
        {selectedRate.refundable === false && (
          <span
            className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium ml-1"
            title="This room cannot be refunded if you cancel"
          >
            Non-refundable
          </span>
        )}
      </div>
      
      {/* --- Icons Section --- */} 
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-base text-gray-600 mb-4">
        {/* Occupancy Icon */} 
        {typeof room.totalSleep === 'number' && (
          <span className="flex items-center gap-1">
            <UserGroupIcon className="h-5 w-5 text-gray-500" />
            {room.totalSleep} guest{room.totalSleep !== 1 ? 's' : ''}
          </span>
        )}
        {/* Bed Type Icon - Updated */} 
        {room.beds?.[0]?.type && (
          <span className="flex items-center gap-1">
            <Bed className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
            {room.beds[0].type} {room.beds[0].count ? `(${room.beds[0].count})` : ''}
          </span>
        )}
        {/* Smoking Preference Icon */} 
        {smokingPref === 'non-smoking' && (
          <span className="flex items-center gap-1">
            <NoSymbolIcon className="h-5 w-5 text-red-500" />
            Non-Smoking
          </span>
        )}
        {smokingPref === 'smoking' && (
          <span className="flex items-center gap-1">
            <Cigarette className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            Smoking
          </span>
        )}
      </div>
      {/* --- End Icons Section --- */}
      
      {/* Room Amenities */}
      {amenities.length > 0 && (
        <div className="mb-4 flex-grow">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Includes:</h5>
          <div className={`flex flex-wrap gap-x-2 gap-y-1 transition-all duration-300 ${isAmenitiesExpanded ? 'max-h-40' : 'max-h-8 overflow-hidden'}`}> 
            {amenities.map((amenity, i) => (
              <span key={i} className="text-xs text-gray-600">&#8226; {amenity}</span>
            ))}
          </div>
          {amenities.length > 6 && (
            <button
              onClick={toggleAmenities}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold mt-1 block transition-colors duration-200"
            >
              {isAmenitiesExpanded ? 'Show less' : 'See all'}
            </button>
          )}
        </div>
      )}
      
      {/* Cancellation Policy Section - Toggleable */}
      {rateOptions.length > 1 && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Cancellation Policy</h5>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-full p-1">
              {rateOptions.map((rate, idx) => (
                <button
                  key={idx}
                  className={`flex items-center gap-1 px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                    ${selectedRateIdx === idx
                      ? (rate.refundable ? 'bg-green-600 text-white shadow' : 'bg-red-600 text-white shadow')
                      : 'bg-transparent text-gray-600 hover:bg-gray-200'}
                  `}
                  onClick={() => { setSelectedRateIdx(idx); setSelectedExtraIdx(0); }}
                  title={getRateLabel(rate)}
                  aria-pressed={selectedRateIdx === idx}
                >
                  {selectedRateIdx === idx && (
                    <span className="inline-block w-4 h-4 mr-1">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <circle cx="10" cy="10" r="8" className="text-white/30" />
                        <path d="M7 10.5l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  {getRateLabel(rate)}
                </button>
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-400" title="More details on all policy options">ℹ️</span>
          </div>
        </div>
      )}
      {/* If only one rate option, show the label statically */}
      {rateOptions.length === 1 && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Cancellation Policy</h5>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${selectedRate.refundable ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>{getRateLabel(selectedRate)}</span>
            <span className="ml-2 text-xs text-gray-400" title="More details on all policy options">ℹ️</span>
          </div>
        </div>
      )}
      
      {/* Extras Section (if available) - show all extras for this rate as radio buttons */}
      {extras.length > 1 && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Extras</h5>
          <div className="flex flex-col gap-1">
            {extras.map((extra, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name={`extra-${room.roomId || room.groupId}`}
                  checked={selectedExtraIdx === idx}
                  onChange={() => setSelectedExtraIdx(idx)}
                  className="accent-blue-600"
                />
                {getExtraLabel(extra)}
                {extra.price && typeof extra.price.total === 'number' && (
                  <span className="text-xs text-gray-500 ml-1">{extra.price.total > 0 ? `+ $${extra.price.total.toFixed(2)}` : '+$0.00'}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
      {/* If only one extra, show it statically */}
      {extras.length === 1 && selectedExtra.boardBasis && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Extras</h5>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-gray-700">{selectedExtra.boardBasis}</span>
          </div>
        </div>
      )}
      
      {/* Room Availability - Numeric only */}
      {typeof room.availability === 'string' && !isNaN(Number(room.availability)) && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Rooms left</span>
            <span>{room.availability}</span>
          </div>
        </div>
      )}
      
      {/* Price and Button Container */} 
      <div className="mt-auto pt-5 border-t border-gray-100"> 
        {/* Price */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-2">
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              {displayPrice !== undefined ? `$${displayPrice.toFixed(2)} ${currency || 'USD'}` : 'Price not available'}
              {displayPrice !== undefined && <span className="text-base text-gray-500 font-normal">{priceLabel}</span>}
              {/* You save badge if applicable */}
              {roomPriceInfo?.publishedRate && displayPrice !== undefined && roomPriceInfo.publishedRate > displayPrice && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm font-semibold ml-2 animate-pulse">
                  You save ${Math.round(roomPriceInfo.publishedRate - displayPrice)}!
                </span>
              )}
            </p>
            <p className="text-xs text-gray-600">
              Includes taxes & fees
            </p>
            <button
              className="text-xs text-blue-600 underline mt-1 hover:text-blue-800"
              onClick={() => setIsPolicyOpen(true)}
              type="button"
            >
              View Policy
            </button>
          </div>
          <button
            onClick={() => onSelectRoom(room)}
            className="w-full md:w-auto px-6 py-2 bg-[#0071bc] text-white text-lg font-semibold rounded-md hover:bg-[#002855] transition transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Book Now
          </button>
        </div>
      </div>
      {/* Policy Modal */}
      {isPolicyOpen && <PolicyModal />}
    </div>
  );
}; 