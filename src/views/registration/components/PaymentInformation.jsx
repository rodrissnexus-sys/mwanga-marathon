"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/common/SectionHeader';

const PaymentInformation = () => {
  const t = useTranslations("register.payment");
  const paymentMethods = [
    {
      name: "M-PESA",
      description: t("fastAndSecureMobile"),
      link: "tel:*150*00%23",
      linkText: t("dial15000"),
      instructions: [
        t("dial15000"),
        t("selectPayWithLipa"),
        t("select1EnterLipa"),
        t("enterLipaNumber58136742"),
        t("enterAmountBasedOn"),
        t("enterMPesaPin")
      ],
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "MIXX BY YAS",
      description: t("quickAndReliablePayments"),
      link: "tel:*150*01%23",
      linkText: t("dial15001"),
      instructions: [
        t("dial15001"),
        t("selectPayWithLipa"),
        t("select1EnterLipa"),
        t("enterLipaNumber18403062"),
        t("enterAmountBasedOn"),
        t("confirmWithYourPin"),
      ],
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "PESAPAL",
      description: t("multiplePaymentOptionsIn"),
      link: "https://payments.pesapal.com/kisangaratours",
      linkText: t("payWithPesapal"),
      instructions: [
        t("clickOnThePay"),
        t("chooseYourPreferredPayment"),
        t("enterTheAmountFor"),
        t("completeTheTransaction"),
      ],
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      isWebLink: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="payment" className="py-20 relative overflow-hidden bg-gradient-to-b from-tertiary to-tertiary/5">
      {/* Enhanced Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-5 rounded-full -mr-48 -mt-48 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary opacity-5 rounded-full -ml-48 -mb-48 blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-tertiary opacity-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-xl" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        >
          {paymentMethods.map((method) => (
            <motion.div
              key={method.name}
              variants={itemVariants}
              className="bg-gradient-to-b from-tertiary/10 to-primary/5 rounded-2xl p-8 shadow-xl border border-tertiary/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-full shadow-inner">
                    {method.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">{method.name}</h3>
                  <p className="text-sm text-primary/70">{method.description}</p>
                </div>
                <div className="space-y-3">
                  {method.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-secondary font-medium h-6 w-6 flex items-center justify-center bg-secondary/10 rounded-full text-xs">{idx + 1}</span>
                      <p className="text-primary/80 text-sm pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                {method.isWebLink ? (
                  <a 
                    href={method.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-secondary to-secondary/80 text-primary px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1 w-full justify-center"
                  >
                    {method.linkText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : (
                  <a 
                    href={method.link}
                    className="text-primary border-2 border-primary/30 bg-tertiary/5 px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-primary/5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {method.linkText}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 text-tertiary shadow-xl border border-primary/20"
        >
          <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("importantInformation")}
          </h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="bg-tertiary/20 p-2 rounded-full">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-tertiary/90">{t("keepYourPaymentConfirmation")}</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-tertiary/20 p-2 rounded-full">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-tertiary/90">{t("paymentConfirmationMayTake")}</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-tertiary/20 p-2 rounded-full">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-tertiary/90">{t("forSupportInfoMwafem")}</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentInformation;