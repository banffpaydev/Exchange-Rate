// RateModal.js
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const RateModal = ({ isOpen, toggle, highestRates, lowestRates, highestRateVendors, lowestRateVendors }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} className='bg-slate-950 bg-opacity-5 absolute z-50 my-auto w-dvw top-0 left-0 p-4' >
      <ModalHeader toggle={toggle} className='text-xl'>Rates Analysis</ModalHeader>
      <ModalBody className='flex flex-wrap gap-4'>
        <h5 className='text-2xl'>Highest Rates</h5>
        <ul className='border-2 border-blue-950 p-2'>
          {highestRates.map((rate, index) => (
            <li key={index} className='font-semibold'>{rate}</li>
          ))}
        </ul>
        <h5 className='text-2xl'>Lowest Rates</h5>
        <ul className='border-2 border-blue-950 p-2'>
          {lowestRates.map((rate, index) => (
            <li key={index} className='font-semibold'>{rate}</li>
          ))}
        </ul>
        <h5 className='text-2xl'>Vendors with Highest Rates</h5>
        <ul className='border-2 border-blue-950 p-2'>
          {highestRateVendors.map((vendor, index) => (
            <li key={index} className='font-semibold'>{vendor.name} - {vendor.rate}</li>
          ))}
        </ul>
        <h5 className='text-2xl'>Vendors with Lowest Rates</h5>
        <ul className='border-2 border-blue-950 p-2'>
          {lowestRateVendors.map((vendor, index) => (
            <li key={index} className='font-semibold'>{vendor.name} - {vendor.rate}</li>
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