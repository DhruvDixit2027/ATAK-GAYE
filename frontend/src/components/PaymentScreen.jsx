import React, { useEffect, useState } from "react";
import { CheckCircle2, IndianRupee, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { BACKEND_URL } from "../config";

export default function PaymentScreen() {
  const { goTo, currentRequestId, user, winner, showToast } = useApp();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!currentRequestId) {
      goTo("home");
      return;
    }

    async function fetchRequest() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/requests/${currentRequestId}`);
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error("Request fetch karne mein error:", err);
        showToast("Request details load nahi ho payi");
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRequestId]);

  const helperName = request?.helperId?.name || winner?.name || "Helper";
  const helperInit = helperName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const amount = request?.amount || 150;
  const issueType = request?.issueType || "mechanic";

  const handlePayNow = async () => {
    if (!currentRequestId) return;
    setPaying(true);

    try {
      const orderRes = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType }),
      });
      const orderData = await orderRes.json();

      if (!orderData.orderId) {
        showToast("Payment order banane mein error hua");
        setPaying(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Atak Gaye",
        description: `${issueType} - ${helperName}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const payRes = await fetch(
              `${BACKEND_URL}/api/requests/${currentRequestId}/pay`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: orderData.amount / 100,
                }),
              }
            );
            const payData = await payRes.json();

            if (payRes.ok) {
              showToast("✅ Payment successful!");
              goTo("done");
            } else {
              showToast(payData.error || "❌ Payment verify nahi ho paya");
            }
          } catch (err) {
            console.error("Pay confirm error:", err);
            showToast("Payment confirm karne mein error hua");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            showToast("Payment cancel kar diya gaya");
          },
        },
        prefill: {
          name: user?.name || "",
          contact: user?.phone || "",
        },
        theme: { color: "#FF6A3D" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiate karne mein error:", err);
      showToast("Payment shuru nahi ho paya");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-9 h-9 rounded-full border-[3px] border-orange-400 border-t-transparent animate-spin mb-4" />
        <div className="text-sm text-slate-500">Details load ho rahe hain...</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <div className="relative flex-1 overflow-y-auto px-4 sm:px-5 pt-10 pb-6">
        <div className="max-w-md mx-auto w-full">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              Job Complete Ho Gaya!
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Ab payment complete karein
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-orange-500 to-orange-300 shrink-0 shadow-lg">
                {helperInit}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 truncate">
                  {helperName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 capitalize">
                  {issueType} service
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <IndianRupee size={16} className="text-orange-500" />
                Total Amount
              </div>
              <div className="text-xl font-black text-orange-600">₹{amount}</div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
              <ShieldCheck size={13} className="text-green-500" />
              Payment Razorpay ke through securely process hoga
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-4 sm:px-5 pt-6 pb-6 sm:pb-8 bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handlePayNow}
            disabled={paying}
            className="w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-white tracking-wide shadow-[0_20px_40px_rgba(249,115,22,.35)] bg-gradient-to-r from-orange-500 to-orange-600 active:scale-95 transition-all disabled:opacity-60"
          >
            {paying ? "Payment ho raha hai..." : `Pay Now ₹${amount} →`}
          </button>
        </div>
      </div>
    </div>
  );
}