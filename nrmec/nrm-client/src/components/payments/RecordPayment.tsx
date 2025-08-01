import { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import CandidateSearch from './CandidateSearch';
import ParticipationSelector from './ParticipationSelector';
import { useAddPaymentMutation } from '../../store/api/payments_api';
import { useGetFeesQuery } from '../../store/api/fees_api';

interface Candidate {
  id: number;
  ninNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
  electionType: string;
}

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
  category?: string;
  subcategory?: string;
  position: string;
  year: number;
  status: string;
  region?: any;
  subregion?: any;
  district?: any;
  constituencyMunicipality?: any;
  subcountyDivision?: any;
  parishWard?: any;
  villageCell?: any;
  payments?: any[];
}

interface PaymentFormData {
  paymentMethod: string;
  transactionCode?: string;
  amount: number;
}

interface RecordPaymentProps {
  preselectedCandidate?: any;
  onClose?: () => void;
}

const RecordPayment = ({ preselectedCandidate, onClose }: RecordPaymentProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedParticipation, setSelectedParticipation] = useState<CandidateParticipation | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    paymentMethod: 'cash',
    transactionCode: '',
    amount: 0,
  });
  const [addPayment, { isLoading }] = useAddPaymentMutation();
  const { data: fees } = useGetFeesQuery();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Handle preselected candidate if provided
  useEffect(() => {
    if (preselectedCandidate) {
      setSelectedCandidate(preselectedCandidate);
    }
  }, [preselectedCandidate]);

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setSelectedParticipation(null);
    setResult(null);
  };

  const handleParticipationSelect = (participation: CandidateParticipation) => {
    setSelectedParticipation(participation);
    
    // Look up the fee amount for this position path if we have fees data
    if (fees && participation.positionPath) {
      const fee = fees.find(f => f.positionPath === participation.positionPath);
      if (fee) {
        setPaymentForm(prev => ({ ...prev, amount: Number(fee.amount) }));
      } else {
        // Default amount if no fee is found
        setPaymentForm(prev => ({ ...prev, amount: 0 }));
        setResult({ success: false, message: 'No fee configuration found for this position' });
      }
    } else {
      // Default amount if no fees data
      setPaymentForm(prev => ({ ...prev, amount: 0 }));
    }
    
    setResult(null);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentForm(prev => ({
      ...prev,
      paymentMethod: method,
      transactionCode: method === 'cash' ? '' : prev.transactionCode,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidate || !selectedParticipation) {
      setResult({ success: false, message: 'Please select a candidate and position' });
      return;
    }
    
    if (paymentForm.amount <= 0) {
      setResult({ success: false, message: 'Payment amount must be greater than zero' });
      return;
    }
    
    if (paymentForm.paymentMethod !== 'cash' && !paymentForm.transactionCode) {
      setResult({ success: false, message: 'Transaction code is required for non-cash payments' });
      return;
    }

    try {      const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const paymentData = {
        candidateId: selectedCandidate.ninNumber, // Using ninNumber as candidateId since that's how the model is set up
        candidateParticipationId: selectedParticipation.id,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        transactionCode: paymentForm.transactionCode,
        electionType: selectedParticipation.electionType,
        subType: selectedParticipation.level,
        category: selectedParticipation.category,
        position: selectedParticipation.position,
        positionPath: selectedParticipation.positionPath,
        receiptNumber,
        status: 'completed',
        paymentDate: new Date().toISOString(),
        processedBy: 'current-user', // This should be replaced with actual user info
        candidateName: `${selectedCandidate.firstName} ${selectedCandidate.lastName}`,
      };
   
      console.log('Payment Data:', paymentData);

      await addPayment(paymentData).unwrap();
      setResult({ success: true, message: `Payment recorded successfully! Receipt: ${receiptNumber}` });
      
      // After a successful payment, wait a moment to show the success message, then close or reset
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          resetForm();
        }
      }, 2000);
    } catch (error: any) {
      setResult({ success: false, message: error.data?.message || 'Failed to record payment' });
    }
  };

  const resetForm = () => {
    setSelectedCandidate(null);
    setSelectedParticipation(null);
    setPaymentForm({
      paymentMethod: 'cash',
      transactionCode: '',
      amount: 0,
    });
  };
  return (
    <div className="bg-white rounded-lg">
      {result && (
        <div className={`p-4 mb-6 rounded-md ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result.message}
        </div>
      )}
      
      <CandidateSearch onSelectCandidate={handleCandidateSelect} />
      
      {selectedCandidate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Selected Candidate</h3>
          <p className="text-gray-900">
            <span className="font-semibold">{selectedCandidate.firstName} {selectedCandidate.lastName}</span> - 
            NIN: {selectedCandidate.ninNumber}, Tel: {selectedCandidate.phoneNumber}
          </p>
        </div>
      )}
        {selectedCandidate && (
        <ParticipationSelector 
          candidateId={selectedCandidate.id} 
          onSelectParticipation={handleParticipationSelect} 
        />
      )}
      
      {selectedParticipation && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">Selected Position</h3>
            <p className="text-gray-900">
              <span className="font-semibold">{selectedParticipation.position}</span>
              {selectedParticipation.category && ` - ${selectedParticipation.category}`}
              {selectedParticipation.subcategory && ` - ${selectedParticipation.subcategory}`}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {selectedParticipation.positionPath}
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">UGX</span>
                </div>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="pl-12 w-full p-2 border rounded-lg focus:ring-1 focus:ring-yellow-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('cash')}
                className={`p-3 border rounded-md text-center ${
                  paymentForm.paymentMethod === 'cash'
                    ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('bank')}
                className={`p-3 border rounded-md text-center ${
                  paymentForm.paymentMethod === 'bank'
                    ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('mobile')}
                className={`p-3 border rounded-md text-center ${
                  paymentForm.paymentMethod === 'mobile'
                    ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Mobile Money
              </button>
            </div>
          </div>
          
          {paymentForm.paymentMethod !== 'cash' && (
            <div>
              <label htmlFor="transactionCode" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Reference/Code
              </label>
              <input
                id="transactionCode"
                type="text"
                value={paymentForm.transactionCode}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionCode: e.target.value }))}
                placeholder="Enter transaction reference number"
                className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>
          )}
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
            >
              <Receipt className="h-5 w-5" />
              {isLoading ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecordPayment;
