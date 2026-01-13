import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import QRCode from "react-qr-code";
import { Loader2 } from "lucide-react";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const TicketDetails = () => {
  const { ticketid } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/Bus/get-ticket/${ticketid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setTicket(res.data.ticket);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          t("ticketDetails.fetchError");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchTicket();
  }, [ticketid, getAccessTokenSilently, isAuthenticated, t]);

  if (loading)
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-blue-50"
        }`}
      >
        <Loader2
          className={`animate-spin w-6 h-6 ${
            darktheme ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <span
          className={`ml-2 ${darktheme ? "text-blue-300" : "text-blue-800"}`}
        >
          {t("ticketDetails.loading")}
        </span>
      </div>
    );

  if (!ticket)
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-blue-50"
        }`}
      >
        <p
          className={`text-lg ${darktheme ? "text-gray-400" : "text-gray-700"}`}
        >
          {t("ticketDetails.noTicketFound")}
        </p>
      </div>
    );

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen flex justify-center items-center py-10 px-4 ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-100 to-blue-200"
        }`}
      >
        <div
          className={`rounded-lg shadow-2xl w-full max-w-md p-6 relative border-2 ${
            darktheme
              ? "bg-gradient-to-b from-gray-700 via-gray-800 to-gray-700 border-gray-600"
              : "bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 border-blue-400"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h1
              className={`text-2xl font-bold tracking-wide ${
                darktheme ? "text-blue-300" : "text-blue-900"
              }`}
            >
              {t("ticketDetails.happyJourney")}
            </h1>
          </div>

          {/* Journey Type and Date */}
          <div
            className={`flex justify-between items-center mb-3 ${
              darktheme ? "text-gray-200" : "text-blue-900"
            }`}
          >
            <div className="text-base font-semibold">
              {t("ticketDetails.journey")}
            </div>
            <div className="text-base font-semibold">
              {new Date(ticket.createdAt)
                .toLocaleDateString("en-GB")
                .replace(/\//g, "/")}
            </div>
          </div>

          {/* Price and Payment ID */}
          <div
            className={`flex justify-between items-center mb-2 ${
              darktheme ? "text-gray-200" : "text-blue-900"
            }`}
          >
            <div className="text-base font-bold">
              {t("ticketDetails.rs")} {ticket.ticketPrice.toFixed(2)}/-
            </div>
            <div className="text-sm font-mono">
              {ticket.razorpay_payment_id?.slice(-10) || "N/A"}
            </div>
          </div>

          {/* Ticket Number */}
          <div
            className={`mb-4 ${darktheme ? "text-gray-200" : "text-blue-900"}`}
          >
            <p className="text-sm font-bold">
              {t("ticketDetails.paymentId")} {ticket.razorpay_payment_id}
            </p>
          </div>

          {/* Route Information */}
          <div className="mb-4 space-y-3">
            {/* From Station */}
            <div
              className={`rounded p-2 border-l-4 border-orange-500 ${
                darktheme
                  ? "bg-gray-700 bg-opacity-60"
                  : "bg-white bg-opacity-40"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  darktheme ? "text-gray-300" : "text-blue-900"
                }`}
              >
                {ticket.fromAddress.local}
              </p>
              <p
                className={`text-base font-bold ${
                  darktheme ? "text-white" : "text-blue-900"
                }`}
              >
                {ticket.fromAddress.english}
              </p>
            </div>

            {/* To Station */}
            <div
              className={`rounded p-2 border-l-4 border-green-600 ${
                darktheme
                  ? "bg-gray-700 bg-opacity-60"
                  : "bg-white bg-opacity-40"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  darktheme ? "text-gray-300" : "text-blue-900"
                }`}
              >
                {ticket.toAddress.local}
              </p>
              <p
                className={`text-base font-bold ${
                  darktheme ? "text-white" : "text-blue-900"
                }`}
              >
                {ticket.toAddress.english}
              </p>
            </div>
          </div>

          {/* Passenger Count */}
          <div
            className={`flex gap-8 mb-3 ${
              darktheme ? "text-gray-200" : "text-blue-900"
            }`}
          >
            <div className="text-sm font-bold">
              {t("ticketDetails.adult")} : 1
            </div>
            <div className="text-sm font-bold">
              {t("ticketDetails.child")} : 0
            </div>
          </div>

          {/* Class and Train Details */}
          <div
            className={`grid grid-cols-2 gap-2 mb-3 ${
              darktheme ? "text-gray-200" : "text-blue-900"
            }`}
          >
            <div className="text-xs">
              <span className="font-semibold">
                {t("ticketDetails.secondLocal")}
              </span>
            </div>
            <div className="text-xs">
              <span className="font-semibold">
                {t("ticketDetails.ordinaryLocal")}
              </span>
            </div>
            <div className="text-xs font-bold">
              {t("ticketDetails.classSecond")}
            </div>
            <div className="text-xs font-bold">
              {t("ticketDetails.trainOrdinary")}
            </div>
            <div className="text-xs">
              <span className="font-semibold">
                {t("ticketDetails.secondLocal")}
              </span>
            </div>
            <div className="text-xs">
              <span className="font-semibold">
                {t("ticketDetails.ordinaryLocal")}
              </span>
            </div>
          </div>

          {/* VIA */}
          <div
            className={`mb-3 text-xs ${
              darktheme ? "text-gray-200" : "text-blue-900"
            }`}
          >
            <span className="font-bold">{t("ticketDetails.via")} : ------</span>
          </div>

          {/* SAC and IR Details */}
          <div
            className={`flex justify-between mb-3 text-xs font-mono ${
              darktheme ? "text-gray-300" : "text-blue-900"
            }`}
          >
            <div>
              {t("ticketDetails.sac")}:{ticket._id.slice(-6)}
            </div>
            <div>{t("ticketDetails.ir")}:27AAAGM0289C2ZI</div>
          </div>

          {/* Journey Notice */}
          <div
            className={`text-center mb-3 text-xs font-semibold ${
              darktheme ? "text-gray-300" : "text-blue-900"
            }`}
          >
            {t("ticketDetails.journeyNotice")}
          </div>

          {/* Vaccination/Verification */}
          <div
            className={`rounded p-2 mb-3 text-center ${
              darktheme ? "bg-gray-700" : "bg-white"
            }`}
          >
            <p
              className={`text-xs font-bold ${
                darktheme ? "text-red-400" : "text-red-600"
              }`}
            >
              {t("ticketDetails.vaccinated")}:
              {ticket.user?.email?.slice(0, 15) || ticket.email.slice(0, 15)}/
            </p>
            <p
              className={`text-xs font-bold ${
                darktheme ? "text-red-400" : "text-red-600"
              }`}
            >
              {ticket.user?.name || ticket.name}
            </p>
          </div>

          {/* Ticket ID and Distance */}
          <div
            className={`flex justify-between items-center mb-3 text-sm font-bold ${
              darktheme ? "text-gray-200" : "text-blue-900"
            }`}
          >
            <div>{ticket._id.slice(-6).toUpperCase()}</div>
            <div>
              {t("ticketDetails.distance")}: {ticket.passengerDistance}
              {t("ticketDetails.km")}
            </div>
          </div>

          {/* Booking Time */}
          <div
            className={`text-xs mb-4 ${
              darktheme ? "text-gray-300" : "text-blue-900"
            }`}
          >
            <span className="font-semibold">
              {t("ticketDetails.bookingTime")}{" "}
            </span>
            {new Date(ticket.createdAt).toLocaleDateString("en-GB")}{" "}
            {new Date(ticket.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* QR Code */}
          <div
            className={`flex justify-center p-3 rounded-md shadow-inner ${
              darktheme ? "bg-gray-700" : "bg-white"
            }`}
          >
            <QRCode
              value={JSON.stringify({
                ticketId: ticket._id,
                user: ticket.user?.email || ticket.email,
                busId: ticket.busId,
                from: ticket.fromAddress.english,
                to: ticket.toAddress.english,
              })}
              size={120}
            />
          </div>

          {/* Footer Warning */}
          <div
            className={`mt-4 text-center text-xs opacity-75 ${
              darktheme ? "text-gray-400" : "text-blue-900"
            }`}
          >
            {t("ticketDetails.footerWarning")}
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetails;
