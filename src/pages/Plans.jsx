import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  Timestamp 
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { PlusIcon, TrashIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";

export default function Plans() {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [totalMeals, setTotalMeals] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchPlans();
    }
  }, [currentUser]);

  async function fetchPlans() {
    try {
      const q = query(collection(db, "plans"), where("messId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const plansList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(plansList);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "plans"), {
        messId: currentUser.uid,
        name,
        price: Number(price),
        totalMeals: Number(totalMeals) || 0,
        validityDays: Number(validityDays) || 30,
        description,
        createdAt: Timestamp.now()
      });

      closeModal();
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("तुम्हाला खात्री आहे की तुम्ही हा प्लॅन काढू इच्छिता?")) {
      try {
        await deleteDoc(doc(db, "plans", id));
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setName("");
    setPrice("");
    setTotalMeals("");
    setValidityDays("");
    setDescription("");
  }

  return (
    <Layout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">मेस प्लॅन्स (Meal Plans)</h1>
          <p className="mt-2 text-sm text-gray-700">
            तुमचे जेवणाचे प्लॅन आणि त्यांच्या किंमती व्यवस्थापित करा.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[#0F4C3A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#073327] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 sm:w-auto transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            नवीन प्लॅन जोडा
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="relative flex items-center space-x-3 rounded-xl border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-[#0F4C3A] focus-within:ring-offset-2 hover:border-[#0F4C3A] transition-all">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-[#E8F3EF] flex items-center justify-center text-[#0F4C3A]">
                <CurrencyRupeeIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <a href="#" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                <p className="truncate text-sm text-gray-500">₹{plan.price}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {plan.totalMeals ? `${plan.totalMeals} जेवण (Meals)` : "अमर्यादित (Unlimited)"}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {plan.validityDays} दिवस (Days)
                  </span>
                </div>
                {plan.description && <p className="truncate text-xs text-gray-400 mt-1">{plan.description}</p>}
              </a>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleDelete(plan.id);
              }}
              className="z-10 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        {plans.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-gray-500">
            अद्याप कोणतेही प्लॅन जोडलेले नाहीत.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pt-5 pb-4 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-gray-100">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  नवीन मेस प्लॅन जोडा
                </h3>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      प्लॅनचे नाव (उदा. 1 टाइम जेवण)
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      किंमत (महिन्यासाठी)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="block w-full rounded-xl border-gray-300 pl-7 pr-12 focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                        placeholder="0.00"
                      />
                    </div>
                    </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="totalMeals" className="block text-sm font-medium text-gray-700">
                        एकूण जेवण (Total Meals)
                      </label>
                      <input
                        type="number"
                        name="totalMeals"
                        id="totalMeals"
                        value={totalMeals}
                        onChange={(e) => setTotalMeals(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                        placeholder="0 for Unlimited"
                      />
                    </div>
                    <div>
                      <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700">
                        वैधता दिवस (Validity Days)
                      </label>
                      <input
                        type="number"
                        name="validityDays"
                        id="validityDays"
                        value={validityDays}
                        onChange={(e) => setValidityDays(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                        placeholder="30"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      वर्णन (ऐच्छिक)
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm border p-2"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-xl border border-transparent bg-[#0F4C3A] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#073327] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 sm:col-start-2 sm:text-sm transition-colors"
                    >
                      जतन करा
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
