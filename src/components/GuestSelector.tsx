import React, { useState, useRef, useEffect } from 'react'

// Define type for a single room's occupancy (should match BookingWidget)
interface Occupancy {
  adults: number;
  children: number;
  childAges: number[];
}

interface GuestSelectorProps {
  occupancies: Occupancy[];
  onOccupanciesChange: (occupancies: Occupancy[]) => void;
  onClose: () => void; // Add onClose prop
}

// Define styles for the counter buttons
const counterButtonClasses = "w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed";

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  occupancies,
  onOccupanciesChange,
  onClose,
}) => {

  // Handler to update a specific room's guest count
  const updateRoomOccupancy = (roomIndex: number, type: 'adults' | 'children', delta: number) => {
    const newOccupancies = occupancies.map((room, index) => {
      if (index === roomIndex) {
        const currentValue = room[type];
        const newValue = Math.max(type === 'adults' ? 1 : 0, currentValue + delta); // Adults minimum 1, Children minimum 0
        return { ...room, [type]: newValue };
      }
      return room;
    });
    onOccupanciesChange(newOccupancies);
  };

  // Handler to add a new room
  const addRoom = () => {
    const newRoom: Occupancy = { adults: 1, children: 0, childAges: [] }; // Default for new room
    onOccupanciesChange([...occupancies, newRoom]);
  };

  // Handler to remove a room (optional, can be added later if needed)
  // const removeRoom = (roomIndex: number) => {
  //   if (occupancies.length > 1) {
  //     const newOccupancies = occupancies.filter((_, index) => index !== roomIndex);
  //     onOccupanciesChange(newOccupancies);
  //   }
  // };

  return (
    // Removed the outer button and isOpen logic - handled by BookingWidget
    // Added padding to the main container div
    <div className="p-4 space-y-4">
      {occupancies.map((room, index) => (
        <div key={index} className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">Room {index + 1}</h4>
          {/* Adults Counter */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Adults</span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => updateRoomOccupancy(index, 'adults', -1)}
                disabled={room.adults <= 1} // Disable minus if adults is 1
                className={counterButtonClasses}
              >
                -
              </button>
              <span className="text-sm font-medium text-gray-900 w-4 text-center">{room.adults}</span>
              <button
                type="button"
                onClick={() => updateRoomOccupancy(index, 'adults', 1)}
                className={counterButtonClasses}
              >
                +
              </button>
            </div>
          </div>
          {/* Children Counter */}
          <div className="flex items-center justify-between">
            <div>
                <span className="text-sm text-gray-700">Children</span>
                <div className="text-xs text-gray-500">Ages 0 to 17</div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => updateRoomOccupancy(index, 'children', -1)}
                disabled={room.children <= 0} // Disable minus if children is 0
                className={counterButtonClasses}
              >
                -
              </button>
              <span className="text-sm font-medium text-gray-900 w-4 text-center">{room.children}</span>
              <button
                type="button"
                onClick={() => updateRoomOccupancy(index, 'children', 1)}
                className={counterButtonClasses}
              >
                +
              </button>
            </div>
          </div>
           {/* Child age selectors would go here if needed */}
           {index < occupancies.length -1 && <hr className="my-3"/>} {/* Add divider between rooms */} 
        </div>
      ))}

      {/* Add Room Button */}
      <div>
        <button
          type="button"
          onClick={addRoom}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Add another room
        </button>
      </div>

      {/* Divider and Done Button */}
      <hr />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose} // Use the onClose prop to close the dropdown
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}; 