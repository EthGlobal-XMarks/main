import React from 'react';
import { countries } from '../data/countries'; // Adjust path as necessary

const SelectCountry = ({ onCountryChange }) => {
  return (
    <select onChange={(e) => onCountryChange(e.target.value)}>
      {countries.map((item, index) => (
        <option key={index} value={item.country}>
          {item.name}
        </option>
      ))}
    </select>
  );
};

export default SelectCountry;
