import React, { useState, useEffect } from "react";
import { getTransferDetails } from "../../store/features/Transfer/Transfer";
import "./style.css";
import { CircularProgress } from "@material-ui/core";
import { useAppSelector } from "../../store/hooks";
import StatusComp from "../StatusComp";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import StatusButtons from "../StatusButtons";
import CashLayout from "../CashLayout";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const RATE = 655.957;

const TransactionDetails: React.FC<any> = ({ selectedTransfer }) => {
  const [url, setUrl] = useState("");
  const [fetchData, setFetchedData] = useState<any>(null);
  const [fetching, setFetching] = useState<any>(true);
  const {
    auth: { user },
  } = useAppSelector((state) => state.persistedReducer);
  const { t } = useTranslation();

  const isSender = user?.id === selectedTransfer?.source_user?.id;

  const getOperationMetaData = () => {
    getTransferDetails(selectedTransfer.payment_id)
      .then((response: any) => {
        setFetching(false);
        console.log(response);
        setFetchedData(response);
      })
      .catch((error) => {
        setFetching(false);
      });
  };

  useEffect(() => {
    getOperationMetaData();
  }, []);

  return (
    <>
      <div>
        {url === "" ? (
          <>
            {fetching ? (
              <div className="fh-full w-full p-4" style={{ height: 600 }}>
                <b className="text-gray-400">
                  <small>{t("status")}</small>
                </b>
                <Skeleton height={80} />
                <br />
                <b className="text-gray-400">
                  <small>{t("Details")}</small>
                </b>
                <Skeleton height={140} />
                <br />
                <b className="text-gray-400">
                  <small>{t("Details")}</small>
                </b>
                <Skeleton height={250} />
              </div>
            ) : (
              <div className="detailModal p-2 overflow-y-scroll">
                <div className="status">
                  <div className="mb-3">
                    <b>{t("status")}</b>
                  </div>
                  <div className="shadow-md p-2">
                    {fetchData?.history?.payment && (
                      <StatusComp body={fetchData.history.payment} t={t} />
                    )}

                    {fetchData?.history?.cashout && (
                      <StatusComp body={fetchData.history.cashout} t={t} />
                    )}

                    {fetchData?.history?.escrow_transfer && (
                      <StatusComp
                        body={fetchData.history.escrow_transfer}
                        t={t}
                      />
                    )}

                    {fetchData?.history?.confirmations && (
                      <StatusComp
                        body={fetchData.history.confirmations}
                        t={t}
                      />
                    )}

                    {fetchData?.history?.instant_transfer && (
                      <StatusComp
                        body={fetchData.history.instant_transfer}
                        t={t}
                      />
                    )}

                    {fetchData?.history?.execution && (
                      <StatusComp body={fetchData.history.execution} t={t} />
                    )}

                    {fetchData?.history?.cashin && (
                      <StatusComp body={fetchData.history.cashin} t={t} />
                    )}
                  </div>
                </div>

                {!isSender ? (
                  <div className="head">
                    <div className="flex justify-between mb-3">
                      <b className="">{t("Sender")}</b>
                    </div>
                    <div className="shadow-md p-4">
                      {fetchData?.source_user?.is_individual ? (
                        <div>
                          <small className="flex justify-between mb-1">
                            <b>{t("Name")}</b>
                            <span>{fetchData?.source_user?.full_name}</span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("Email")}</b>
                            <span>{fetchData?.source_user?.email}</span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("IBAN")}</b>
                            <span>
                              {fetchData?.source_user?.company?.iban_code}
                            </span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("CompanyRegistrationNo")}</b>
                            <span>
                              {fetchData?.source_user?.company?.registered_id}
                            </span>
                          </small>
                        </div>
                      ) : (
                        <div>
                          <small className="flex justify-between mb-1">
                            <b>{t("Name")}</b>
                            <span>{fetchData?.source_user?.full_name}</span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("Email")}</b>
                            <span>{fetchData?.source_user?.email}</span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("phone")}</b>
                            <span>
                              {fetchData?.source_user?.full_phone_number}
                            </span>
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="head">
                    <div className="flex justify-between mb-3">
                      <b className="">{t("Receiver")}</b>
                    </div>
                    <div className="shadow-md p-4">
                      {fetchData?.destination_user?.is_individual ? (
                        <div>
                          <small className="flex justify-between mb-1">
                            <b>{t("Name")}</b>
                            <span>
                              {fetchData?.destination_user?.full_name}
                            </span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("Email")}</b>
                            <span>{fetchData?.destination_user?.email}</span>
                          </small>
                        </div>
                      ) : (
                        <div>
                          <small className="flex justify-between mb-1">
                            <b>{t("Name")}</b>
                            <span>
                              {fetchData?.destination_user?.full_name}
                            </span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("Email")}</b>
                            <span>{fetchData?.destination_user?.email}</span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("company")}</b>
                            <span>
                              {fetchData?.destination_user?.company?.name}
                            </span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("IBAN")}</b>
                            <span>
                              {fetchData?.destination_user?.company?.iban_code}
                            </span>
                          </small>

                          <small className="flex justify-between mb-1">
                            <b>{t("CompanyRegistrationNo")}</b>
                            <span>
                              {
                                fetchData?.destination_user?.company
                                  ?.registered_id
                              }
                            </span>
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="details">
                  <div className="mb-3">
                    <b>{t("Details")}</b>
                  </div>
                  <div className="shadow-md p-4">
                    <small className="flex justify-between mb-2">
                      <b>{t("Payment_method")}</b>
                      <b className="capitalize">{t(fetchData?.type)}</b>
                    </small>

                    <small className="flex justify-between mb-2">
                      <b>{t("Sent_amount")}</b>
                      <b>
                        <CashLayout cash={fetchData?.amount_without_fee} />
                      </b>
                    </small>
                    {isSender ? (
                      <small className="flex justify-between mb-2">
                        <b>{t("Fees")}</b>
                        <b>
                          <CashLayout
                            cash={+fetchData?.applied_fees?.value || 0}
                          />
                        </b>
                      </small>
                    ) : null}
                    <small className="flex justify-between mb-2">
                      <b>{t("Exchange_rate")}</b>
                      <span>1€ = {RATE} XOF</span>
                    </small>
                    <small className="flex justify-between mb-2 text-green-600 font-bold">
                      <b> {t("Received_amount")}</b>
                      <span>
                        <b>
                          <CashLayout cash={+fetchData?.amount_without_fee} />{" "}
                        </b>
                      </span>
                    </small>
                  </div>
                </div>

                {/* <div className="flex flex-row justify-end my-2">
                  <StatusButtons transfer={fetchData} />
                </div> */}
              </div>
            )}
          </>
        ) : (
          <iframe
            src={url}
            width="80%"
            title="description"
            style={{ height: "100vh", margin: "auto" }}
          ></iframe>
        )}
      </div>
    </>
  );
};

export default TransactionDetails;
