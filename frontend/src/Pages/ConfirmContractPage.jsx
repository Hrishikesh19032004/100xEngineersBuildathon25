import React, { useState } from 'react';

import { FileText, Users, CheckCircle } from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { Link } from 'react-router-dom';

const ContractPage = () => {
  const [step, setStep] = useState(1); 
  const [contractId, setContractId] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form data for contract creation
  const [formData, setFormData] = useState({
    brandName: '',
    influencerName: '',
    product: '',
    rate: '',
    timeline: ''
  });

  // Signature states
  const [brandSignature, setBrandSignature] = useState(null);
  const [influencerSignature, setInfluencerSignature] = useState(null);
  const [signingAs, setSigningAs] = useState('brand'); // 'brand' or 'influencer'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateContract = async () => {
    setLoading(true);

    const preparedData = {
      ...formData,
      rate: formData.rate === '' ? null : Number(formData.rate),
    };

    try {
      const response = await fetch('http://localhost:5003/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create contract');
      }
      
      setContractId(data.contract.id);
      setContract(data.contract);
      setStep(2);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async (signature, signerType) => {
    if (!signature || !contractId) return;

    setLoading(true);
    
    try {
      const endpoint = signerType === 'brand' 
        ? `/api/contracts/${contractId}/sign-brand`
        : `/api/contracts/${contractId}/sign-influencer`;
      
      const response = await fetch(`http://localhost:5003${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign contract');
      }

      // Update contract state
      setContract(data.contract);
      
      if (signerType === 'brand') {
        setBrandSignature(signature);
      } else {
        setInfluencerSignature(signature);
      }

      // Check if contract is fully signed
      if (data.contract.contract_status === 'fully_signed') {
        setStep(3);
      }

    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Error signing contract: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadContract = async (id) => {
    try {
      const response = await fetch(`http://localhost:5003/api/contracts/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load contract');
      }
      
      setContract(data.contract);
      setContractId(id);
      
      if (data.contract.brand_signature) {
        setBrandSignature(data.contract.brand_signature);
      }
      if (data.contract.influencer_signature) {
        setInfluencerSignature(data.contract.influencer_signature);
      }
      
      if (data.contract.contract_status === 'fully_signed') {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
    }
  };

  // Step 1: Contract Creation
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full">
          <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg inline-block mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Create Contract</h2>
              <p className="text-gray-400">Fill out the contract details</p>
            </div>

            <div className="space-y-4 mb-6">
              {['brandName', 'influencerName', 'product', 'rate', 'timeline'].map(field => (
                <input
                  key={field}
                  name={field}
                  type={field === 'rate' ? 'number' : 'text'}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              ))}
            </div>

            <button
              onClick={handleCreateContract}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              {loading ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Contract Signing
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-900 text-white px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg inline-block mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Sign Contract</h2>
              <p className="text-gray-400">Contract ID: {contractId}</p>
            </div>

            {/* Contract Details */}
            {contract && (
              <div className="bg-gray-700/30 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4">Contract Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Brand:</strong> {contract.brand_name}</div>
                  <div><strong>Influencer:</strong> {contract.influencer_name}</div>
                  <div><strong>Product:</strong> {contract.product}</div>
                  <div><strong>Rate:</strong> ${contract.rate}</div>
                  <div><strong>Timeline:</strong> {contract.timeline}</div>
                  <div><strong>Status:</strong> {contract.contract_status}</div>
                </div>
              </div>
            )}

            {/* Signing Section */}
            <div className="space-y-8">
              {/* Role Selection */}
              <div className="mb-6 text-center">
                <p className="text-gray-300 mb-4">Who is signing this contract?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setSigningAs('brand')}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      signingAs === 'brand' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    Brand ({contract?.brand_name})
                  </button>
                  <button
                    onClick={() => setSigningAs('influencer')}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      signingAs === 'influencer' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    Influencer ({contract?.influencer_name})
                  </button>
                </div>
              </div>

              {/* Brand Signature Section */}
              <div className="bg-gray-700/30 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  Brand Signature 
                  {brandSignature && <span className="ml-2 text-green-400">✓</span>}
                </h3>
                {brandSignature ? (
                  <div>
                    <img src={brandSignature} alt="Brand Signature" className="border rounded bg-white max-h-48" />
                    <p className="text-green-400 mt-2">✓ Brand has signed this contract</p>
                    {contract?.brand_signed_at && (
                      <p className="text-gray-400 text-sm">
                        Signed on: {new Date(contract.brand_signed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : signingAs === 'brand' ? (
                  <div>
                    <p className="text-gray-300 mb-4">Please provide your signature below:</p>
                    <SignaturePad
                      onSave={(signature) => handleSignContract(signature, 'brand')}
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Waiting for brand signature...</p>
                  </div>
                )}
              </div>

              {/* Influencer Signature Section */}
              <div className="bg-gray-700/30 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  Influencer Signature
                  {influencerSignature && <span className="ml-2 text-green-400">✓</span>}
                </h3>
                {influencerSignature ? (
                  <div>
                    <img src={influencerSignature} alt="Influencer Signature" className="border rounded bg-white max-h-48" />
                    <p className="text-green-400 mt-2">✓ Influencer has signed this contract</p>
                    {contract?.influencer_signed_at && (
                      <p className="text-gray-400 text-sm">
                        Signed on: {new Date(contract.influencer_signed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : signingAs === 'influencer' ? (
                  <div>
                    <p className="text-gray-300 mb-4">Please provide your signature below:</p>
                    <SignaturePad
                      onSave={(signature) => handleSignContract(signature, 'influencer')}
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Waiting for influencer signature...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Contract Complete
  // Step 3: Contract Complete
return (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 pt-20">
    <div className="max-w-md w-full">
      <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl border border-gray-700 text-center">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-lg inline-block mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Contract Completed!</h2>
        <p className="text-gray-400 mb-6">Contract ID: {contractId}</p>
        <p className="text-green-400 mb-6">✓ Both parties have signed the contract</p>

        {/* Payment Navigation Button */}
        <Link 
          to="/business/payement"
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg mb-4 hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-medium"
        >
          Proceed to Payment
        </Link>

        {/* Reset for new contract */}
        <button
          onClick={() => {
            setStep(1);
            setContractId(null);
            setContract(null);
            setBrandSignature(null);
            setInfluencerSignature(null);
            setFormData({
              brandName: '',
              influencerName: '',
              product: '',
              rate: '',
              timeline: ''
            });
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-medium"
        >
          Create New Contract
        </button>
      </div>
    </div>
  </div>
);

};

export default ContractPage;