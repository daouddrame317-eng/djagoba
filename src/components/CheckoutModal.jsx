import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  MapPin, 
  User, 
  Phone, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Truck
} from 'lucide-react';
import { PAYMENT_METHODS, initiateMobileMoneyPayment } from '../lib/paymentService';

export default function CheckoutModal({ product, sellerName, onClose, onCompleteOrder }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Wax Standard');
  const [quantity, setQuantity] = useState(1);
  
  // Customer Form State
  const [fullName, setFullName] = useState('Awa Traoré');
  const [phone, setPhone] = useState('07 08 99 12 34');
  const [selectedCommune, setSelectedCommune] = useState('Cocody Riviera 3');
  const [landmark, setLandmark] = useState('Carrefour Lycée Américain, Villa 42');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wave');

  // Loading & Step States
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const unitPrice = product?.livePrice || product?.price || 15000;
  const deliveryFee = 1500;
  const totalPrice = unitPrice * quantity + deliveryFee;

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !landmark.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const generatedOrderId = `DJ-${Math.floor(Math.random() * 89999) + 10000}`;

    try {
      const res = await initiateMobileMoneyPayment({
        orderId: generatedOrderId,
        amountXOF: totalPrice,
        phoneNumber: phone,
        customerName: fullName,
        paymentMethod: selectedPaymentMethod,
      });

      setIsProcessing(false);

      if (res.success) {
        setPaymentResult({ ...res, orderId: generatedOrderId });
        
        // Callback to parent application to record order
        onCompleteOrder({
          id: generatedOrderId,
          seller: sellerName || 'Vendeur Certifié Djagoba',
          item: `${product?.title || 'Article Live'} (Taille: ${selectedSize}, Qté: ${quantity})`,
          price: unitPrice * quantity,
          deliveryFee,
          total: totalPrice,
          paymentMethod: selectedPaymentMethod,
          paymentStatus: selectedPaymentMethod === 'wave' ? 'paid' : 'pending',
          address: `Abidjan, ${selectedCommune} (${landmark})`,
          customerName,
          phone
        });
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('Erreur lors du lancement de la transaction. Veuillez rééayer.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* MODAL HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1A1A1A]">Validation de Commande Express</h3>
              <p className="text-[10px] text-gray-500">Paiement Sécurisé Mobile Money 🇨🇮</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          
          {/* STEP RESULT: PAYMENT REDIRECT OR CONFIRMATION PROMPT */}
          {paymentResult ? (
            <div className="py-6 space-y-4 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#00C853]/15 text-[#00C853] flex items-center justify-center mx-auto border border-[#00C853]/30">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="bg-[#00C853] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Commande {paymentResult.orderId} Générée
                </span>
                <h4 className="text-base font-black text-[#1A1A1A]">Paiement en cours d'autorisation</h4>
                <p className="text-xs text-gray-600 px-4 leading-relaxed">
                  {paymentResult.message}
                </p>
              </div>

              {/* Wave Redirect Button */}
              {paymentResult.actionType === 'redirect' && paymentResult.redirectUrl && (
                <a
                  href={paymentResult.redirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Ouvrir l'application Wave pour Payer</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 rounded-2xl"
              >
                Fermer & Consulter le Suivi de Commande
              </button>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              
              {/* PRODUCT RECAP & OPTIONS */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product?.image || product?.featuredProduct?.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80'}
                    alt={product?.title}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Vendeur : {sellerName}</span>
                    <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{product?.title || 'Article Sélectionné'}</h4>
                    <span className="text-sm font-black text-[#FF6B00]">
                      {unitPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Options: Size & Quantity */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-600">Taille :</span>
                    {['S', 'M', 'L', 'XL'].map((sz) => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          selectedSize === sz
                            ? 'bg-[#FF6B00] text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600">Qté :</span>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2 py-0.5 text-gray-500 font-bold hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-2.5 font-black text-xs">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2 py-0.5 text-gray-500 font-bold hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOMER DELIVERY INFORMATION */}
              <div className="space-y-2.5">
                <span className="text-xs font-black text-gray-800 flex items-center gap-1 uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Informations de Livraison
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Nom & Prénom</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Awa Traoré"
                      className="w-full bg-[#F8F9FA] text-xs font-semibold text-[#1A1A1A] p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">N° Mobile Money</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07 08 99 12 34"
                      className="w-full bg-[#F8F9FA] text-xs font-semibold text-[#1A1A1A] p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Commune (Abidjan)</label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full bg-[#F8F9FA] text-xs font-semibold text-[#1A1A1A] p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="Cocody Riviera 3">Cocody (Riviera, Angré)</option>
                      <option value="Marcory Zone 4">Marcory (Zone 4, Biétry)</option>
                      <option value="Yopougon">Yopougon (Maroc, Siporex)</option>
                      <option value="Plateau">Plateau (Centre)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Point de repère</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="ex: Carrefour Lycée"
                      className="w-full bg-[#F8F9FA] text-xs font-semibold text-[#1A1A1A] p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="space-y-2">
                <span className="text-xs font-black text-gray-800 flex items-center gap-1 uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-[#00C853]" />
                  Moyen de Paiement Mobile Money 🇨🇮
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethod === method.id;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853] shadow-xs'
                            : 'bg-[#F8F9FA] border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{method.icon}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-extrabold block truncate">{method.shortName}</span>
                          <span className="text-[9px] text-gray-500 font-medium block">
                            {method.feePct === 0 ? 'Sans frais' : `Frais ${method.feePct}%`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TOTAL PRICING RECAP */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-gray-200/80 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total articles ({quantity})</span>
                  <span>{(unitPrice * quantity).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Livraison Express Moto</span>
                  <span>{deliveryFee.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-[#1A1A1A] pt-1.5 border-t border-gray-200">
                  <span>Total Net à Payer</span>
                  <span className="text-base text-[#FF6B00]">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* ERROR ALERT */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-[#FF003C] text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Initialisation du paiement Mobile Money...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Payer {totalPrice.toLocaleString('fr-FR')} FCFA via {selectedPaymentMethod.toUpperCase()}
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
