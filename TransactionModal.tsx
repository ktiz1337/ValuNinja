
import React, { useState } from 'react';
import { Product, Transaction, TransactionType } from '../types';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddTransaction: (t: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, products, onAddTransaction }) => {
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [qty, setQty] = useState(1);
  const [type, setType] = useState<TransactionType>(TransactionType.OUT);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === productId);
    onAddTransaction({
      id: Math.random().toString(36).substr(2, 9),
      productId,
      branch: product?.branch, // Add branch from product
      date,
      quantity: Number(qty),
      type
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Transaction</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - {p.branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              required
              className="w-full border border-gray-300 rounded-lg p-2.5"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.OUT)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${type === TransactionType.OUT ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                >
                  Usage (Out)
                </button>
                <button
                   type="button"
                   onClick={() => setType(TransactionType.IN)}
                   className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${type === TransactionType.IN ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                >
                  Restock (In)
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
