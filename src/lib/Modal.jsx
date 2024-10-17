// RateModal.js
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const RateModal = ({ isOpen, toggle, highestRates, lowestRates, highestRateVendors, lowestRateVendors }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Rates Analysis</ModalHeader>
      <ModalBody>
        <h5>Highest Rates</h5>
        <ul>
          {highestRates.map((rate, index) => (
            <li key={index}>{rate}</li>
          ))}
        </ul>
        <h5>Lowest Rates</h5>
        <ul>
          {lowestRates.map((rate, index) => (
            <li key={index}>{rate}</li>
          ))}
        </ul>
        <h5>Vendors with Highest Rates</h5>
        <ul>
          {highestRateVendors.map((vendor, index) => (
            <li key={index}>{vendor.name} - {vendor.rate}</li>
          ))}
        </ul>
        <h5>Vendors with Lowest Rates</h5>
        <ul>
          {lowestRateVendors.map((vendor, index) => (
            <li key={index}>{vendor.name} - {vendor.rate}</li>
          ))}
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default RateModal;