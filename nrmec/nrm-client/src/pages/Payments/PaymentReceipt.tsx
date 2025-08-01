import React from 'react';
import { parsePositionPath } from '../../utils/positionPathHelper';

const PaymentReceipt = ({ payment }) => {
  // Format position information
  const getPositionInfo = () => {
    if (payment.positionPath) {
      const pathComponents = parsePositionPath(payment.positionPath);
      return `${pathComponents.position || ''} ${pathComponents.category ? `(${pathComponents.category})` : ''}`;
    } else if (payment.position) {
      return `${payment.position} ${payment.category ? `(${payment.category})` : ''}`;
    }
    return 'N/A';
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white" id="receipt">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Payment Receipt</h1>
        <p className="text-gray-600">Electoral Commission</p>
      </div>

      <div className="border-t border-b border-gray-200 py-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Receipt Number:</p>
            <p className="font-semibold">{payment.receiptNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">{new Date(payment.paymentDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Candidate Name:</p>
            <p className="font-semibold">{payment.candidateName}</p>
          </div>
          <div>
            <p className="text-gray-600">Election Type:</p>
            <p className="font-semibold">{payment.electionType}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Position:</p>
            <p className="font-semibold">{getPositionInfo()}</p>
          </div>
          <div>
            <p className="text-gray-600">Level:</p>
            <p className="font-semibold">{payment.level?.replace(/_/g, ' ') || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Amount Paid:</p>
            <p className="font-semibold">{Number(payment.amount).toLocaleString()} UGX</p>
          </div>
          <div>
            <p className="text-gray-600">Payment Method:</p>
            <p className="font-semibold capitalize">{payment.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-600 text-sm mt-8">
        <p>Thank you for your payment</p>
      </div>
    </div>
  );
};

export default PaymentReceipt;