import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
// import Modal from './Modal';
import useWindowDimensions from '@/hooks/useWindowDimensions';
// import useSmartContract from "./XMarksInteraction"


const Globe = dynamic(() => import('react-globe.gl'), {
    ssr: false,
});

const Earth = ({setLongitude, setLatitude}) => {
  const [places, setPlaces] = useState([]); 
  const [clickTimeout, setClickTimeout] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customCities] = useState([

    // Add more custom cities here
  ]);
  const {width, height} = useWindowDimensions();
  // const { submitGuess } = useSmartContract();

  
  useEffect(() => {
    fetch('/ne_110m_populated_places_simple.geojson')
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok.');
        }
      })
      .then((data) => {
        const { features } = data;
        const mergedPlaces = [...features, ...customCities];
        setPlaces(mergedPlaces);
      })
      .catch((error) => {
        console.error('Error loading places:', error);
      });
  }, []);

  const handleLabelClick = (label, event) => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);

      // Extract latitude and longitude from label properties
      const latitude = label.properties.latitude;
      const longitude = label.properties.longitude;

      console.log(`Double clicked on label: ${label.properties.name}`);
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      setSelectedLocation({ lat: latitude, lng: longitude });
      setIsModalOpen(true); // Open the modal to show the details

    } else {
      // Set a new timeout for a single click
      const newTimeout = setTimeout(() => {
        setClickTimeout(null);
      }, 300); // 300ms timeout for double click detection

      setClickTimeout(newTimeout);
    }
  };

  const handleGlobeClick = (location) => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
  
      // Assuming the 'location' object contains 'lat' and 'lng' or similar properties
      // Adjust these property names based on the actual object structure
      const latitude = typeof location === 'object' ? location.lat : undefined;
      const longitude = typeof location === 'object' ? location.lng : undefined; // Adjusted to correctly reference 'lng' or similar property
  
     // console.log(`Double Clicked at Latitude: ${latitude}, Longitude: ${longitude}`);
      // Opening  A Dialog Box for further processes
      setLongitude(longitude);
    setLatitude(latitude);
      //setSelectedLocation({ lat: latitude, lng: longitude });
      setIsModalOpen(true); // Open the modal to show the details
  
    } else {
      // Set a new timeout for a single click
      const newTimeout = setTimeout(() => {
        setClickTimeout(null);
      }, 300); // 300ms timeout for double click detection
  
      setClickTimeout(newTimeout);
    }
  };

  const handleConfirmClick = async () => {
    const { lat, lng } = selectedLocation;
    await submitGuess(lng, lat); // Note: Ensure longitude and latitude are in the correct order expected by your contract
    setIsModalOpen(false); // Optionally close the modal after submitting
  };
  
  return (
    <div style={{width: "100%"}}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        labelsData={places}
        onLabelClick={handleLabelClick}
        labelLat={(d) => d.properties.latitude}
        labelLng={(d) => d.properties.longitude}
        labelText={(d) => d.properties.name}
        labelSize={(d) => Math.sqrt(d.properties.pop_max) * 4e-4}
        labelDotRadius={(d) => Math.sqrt(d.properties.pop_max) * 4e-4}
        labelColor={() => 'rgba(255, 165, 0, 0.75)'}
        labelResolution={2}
        onGlobeClick={(lat, lng) => handleGlobeClick(lat, lng)} // Handle click events
        width={width*0.7}
        height={height - 65}
      />
      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-bold mb-2">Are you sure about your guess ?</h2>
        <p className="text-lg">Latitude: <span className="font-semibold">{selectedLocation.lat}</span></p>
        <p className="text-lg">Longitude: <span className="font-semibold">{selectedLocation.lng}</span></p>
        <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded text-white">Close</button>
        <button onClick={() => {
          // onClick={handleConfirmClick}
          console.log("Submitted")
          setIsModalOpen(false); // closing the modal after sending
        }} 
        className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white"> Confirm </button>
        </div>
      </Modal> */}


    </div>
  );
};

export default Earth;

