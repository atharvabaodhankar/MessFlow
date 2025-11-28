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
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

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
    setIsSaving(true); // Start saving
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 30);

      const selectedPlan = plans.find(p => p.id === selectedPlanId);

      // Bidirectional Translation Logic
      let nameEnglish = "";
      let nameMarathiVal = "";

      // Simple check for Devanagari characters
      const isInputMarathi = /[^\x00-\x7F]/.test(name);

      if (isInputMarathi) {
        nameMarathiVal = name;
        try {
          nameEnglish = await translateMRtoEN(name);
          console.log(`Translated MR->EN: "${name}" to "${nameEnglish}"`);
        } catch (err) {
          console.error("Failed to translate MR->EN:", err);
          nameEnglish = name; // Fallback
        }
      } else {
        nameEnglish = name;
        try {
          nameMarathiVal = await translateENtoMR(name);
          console.log(`Translated EN->MR: "${name}" to "${nameMarathiVal}"`);
        } catch (err) {
          console.error("Failed to translate EN->MR:", err);
          nameMarathiVal = name; // Fallback
        }
      }

      const customerData = {
        name: nameEnglish, // Always store English name in 'name' field for consistency
        nameMarathi: nameMarathiVal, // Store Marathi name here
        mobile,
        startDate: Timestamp.fromDate(start),
        endDate: Timestamp.fromDate(end),
        messId: currentUser.uid,
        status: "active",
        updatedAt: Timestamp.now(),
        planId: selectedPlan ? selectedPlan.id : null,
        planName: selectedPlan ? selectedPlan.name : null,
        planPrice: selectedPlan ? selectedPlan.price : null,
        customerNumber: Number(customerNumber)
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
      setMobile(customer.mobile);
      setStartDate(customer.startDate.toDate().toISOString().split('T')[0]);
      setSelectedPlanId(customer.planId || "");
      setCustomerNumber(customer.customerNumber || "");
    } else {
      setEditingCustomer(null);
      setName("");
      setMobile("");
      setStartDate(new Date().toISOString().split('T')[0]);
      setSelectedPlanId("");
      const nextNum = await getNextCustomerNumber();
      setCustomerNumber(nextNum);
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
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:w-auto"
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          person.status === 'active' ? 'bg-green-100 text-green-800' : 
                          person.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {person.status === 'active' ? 'सक्रिय' : person.status === 'expiring' ? 'संपत आले' : 'संपले'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => openModal(person)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      नाव
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                    />
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
                    >
                      {isSaving ? "जतन करत आहे..." : "जतन करा"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
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
