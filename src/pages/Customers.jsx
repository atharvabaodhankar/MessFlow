import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  Timestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { translateENtoMR, translateMRtoEN } from "../utils/translator";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Customers() {
  const { currentUser } = useAuth();
  const { isMarathi } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // Add saving state
  
  // Form State
  const [name, setName] = useState("");
  const [nameMarathi, setNameMarathi] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  async function fetchData() {
    try {
      // Fetch Customers
      const q = query(collection(db, "customers"), where("messId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const customerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by customerNumber if available, else by name
      customerList.sort((a, b) => (a.customerNumber || 0) - (b.customerNumber || 0));
      setCustomers(customerList);

      // Fetch Plans
      const plansQuery = query(collection(db, "plans"), where("messId", "==", currentUser.uid));
      const plansSnapshot = await getDocs(plansQuery);
      const plansList = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(plansList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getNextCustomerNumber() {
    // Simple client-side calculation based on current list
    const maxNum = customers.reduce((max, c) => Math.max(max, c.customerNumber || 0), 0);
    return maxNum + 1;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 30);

      const selectedPlan = plans.find(p => p.id === selectedPlanId);

      const customerData = {
        name, // English name
        nameMarathi: nameMarathi || name, // Marathi name (fallback to English if not provided)
        mobile,
        startDate: Timestamp.fromDate(start),
        endDate: Timestamp.fromDate(end),
        messId: currentUser.uid,
        status: "active",
        updatedAt: Timestamp.now(),
        planId: selectedPlan ? selectedPlan.id : null,
        planName: selectedPlan ? selectedPlan.name : null,
        planPrice: selectedPlan ? selectedPlan.price : null,
        customerNumber: Number(customerNumber),
        amountPaid: Number(amountPaid) || 0,
        remainingAmount: (selectedPlan ? selectedPlan.price : 0) - (Number(amountPaid) || 0)
      };

      if (editingCustomer) {
        await updateDoc(doc(db, "customers", editingCustomer.id), customerData);
      } else {
        await addDoc(collection(db, "customers"), {
          ...customerData,
          createdAt: Timestamp.now()
        });
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setIsSaving(false); // End saving
    }
  }

  async function handleDelete(id) {
    if (window.confirm("तुम्हाला खात्री आहे की तुम्ही या ग्राहकाला काढू इच्छिता?")) {
      try {
        await deleteDoc(doc(db, "customers", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  }

  async function openModal(customer = null) {
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setNameMarathi(customer.nameMarathi || "");
      setMobile(customer.mobile);
      setStartDate(customer.startDate.toDate().toISOString().split('T')[0]);
      setSelectedPlanId(customer.planId || "");
      setCustomerNumber(customer.customerNumber || "");
      setAmountPaid(customer.amountPaid || 0);
    } else {
      setEditingCustomer(null);
      setName("");
      setNameMarathi("");
      setMobile("");
      setStartDate(new Date().toISOString().split('T')[0]);
      setSelectedPlanId("");
      const nextNum = await getNextCustomerNumber();
      setCustomerNumber(nextNum);
      setAmountPaid(0);
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCustomer(null);
  }

  return (
    <Layout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">ग्राहक यादी</h1>
          <p className="mt-2 text-sm text-gray-700">
            तुमच्या सर्व ग्राहकांची यादी आणि त्यांचे सबस्क्रिप्शन तपशील.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[#0F4C3A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#073327] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 sm:w-auto transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            नवीन ग्राहक जोडा
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      #
                    </th>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      नाव
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      मोबाईल
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      प्लॅन
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      सुरुवात तारीख
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      शेवटची तारीख
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      पेमेंट
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      स्थिती
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {customers.map((person) => (
                    <tr key={person.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900 sm:pl-6">
                        {person.customerNumber || "-"}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {isMarathi ? (person.nameMarathi || person.name) : person.name}
                        {isMarathi && person.nameMarathi && person.nameMarathi !== person.name && (
                          <span className="block text-xs text-gray-400">{person.name}</span>
                        )}
                        {!isMarathi && person.nameMarathi && (
                           <span className="block text-xs text-gray-400">{person.nameMarathi}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.mobile}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.planName || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.startDate.toDate().toLocaleDateString('mr-IN')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.endDate.toDate().toLocaleDateString('mr-IN')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-900">₹{person.amountPaid || 0} / ₹{person.planPrice || 0}</span>
                          {person.remainingAmount > 0 && (
                            <span className="text-xs text-red-600">बाकी: ₹{person.remainingAmount}</span>
                          )}
                          {person.remainingAmount === 0 && person.planPrice > 0 && (
                            <span className="text-xs text-[#38A169]">पूर्ण भरलेले</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          person.status === 'active' ? 'bg-[#38A169]/10 text-[#38A169]' : 
                          person.status === 'expiring' ? 'bg-[#ECC94B]/10 text-[#ECC94B]' : 
                          'bg-[#E53E3E]/10 text-[#E53E3E]'
                        }`}>
                          {person.status === 'active' ? 'सक्रिय' : person.status === 'expiring' ? 'संपत आले' : 'संपले'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => openModal(person)}
                          className="text-[#0F4C3A] hover:text-[#073327] mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {editingCustomer ? "ग्राहक संपादित करा" : "नवीन ग्राहक जोडा"}
                </h3>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700">
                      ग्राहक क्रमांक (Number)
                    </label>
                    <input
                      type="number"
                      name="customerNumber"
                      id="customerNumber"
                      required
                      value={customerNumber}
                      onChange={(e) => setCustomerNumber(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      नाव (इंग्रजी / English Name)
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                      placeholder="उदा: Atharva Baodhankar"
                    />
                  </div>
                  <div>
                    <label htmlFor="nameMarathi" className="block text-sm font-medium text-gray-700">
                      नाव (मराठी / Marathi Name)
                    </label>
                    <input
                      type="text"
                      name="nameMarathi"
                      id="nameMarathi"
                      value={nameMarathi}
                      onChange={(e) => setNameMarathi(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                      placeholder="उदा: अथर्व बाओधनकर"
                    />
                    <p className="mt-1 text-xs text-gray-500">वैकल्पिक - रिक्त असल्यास इंग्रजी नाव वापरले जाईल</p>
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                      मोबाईल नंबर
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      id="mobile"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                      मेस प्लॅन
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                    >
                      <option value="">-- प्लॅन निवडा --</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - ₹{plan.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      सुरुवात तारीख
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">
                      आतापर्यंत भरलेली रक्कम (₹)
                    </label>
                    <input
                      type="number"
                      name="amountPaid"
                      id="amountPaid"
                      min="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                      placeholder="0"
                    />
                    {selectedPlanId && plans.find(p => p.id === selectedPlanId) && (
                      <p className="mt-1 text-xs text-gray-500">
                        एकूण: ₹{plans.find(p => p.id === selectedPlanId).price} | 
                        बाकी: ₹{(plans.find(p => p.id === selectedPlanId).price - (Number(amountPaid) || 0))}
                      </p>
                    )}
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex w-full justify-center rounded-xl border border-transparent bg-[#0F4C3A] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#073327] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? "जतन करत आहे..." : "जतन करा"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm transition-colors"
                    >
                      रद्द करा
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
