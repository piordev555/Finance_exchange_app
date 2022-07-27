import React, { useEffect, useState } from "react";
import "./styles.css";
import TransactionListItem from "../TransactionListItem/TransactionListItem";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import { useAppSelector } from "../../store/hooks";
import { CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";

interface Props {
  transactions: Transaction[];
  title?: string;
  getAllUserTransfer?: any;
  fetchPrevious?: any;
  fetchNext?: any;
  showLess?: boolean;
}

const TransactionsCard: React.FC<Props> = ({
  title = "",
  fetchPrevious = 0,
  fetchNext = 0,
  showLess = false,
}) => {
  const { t } = useTranslation();
  const transfer = useAppSelector((state) => state.persistedReducer.transfer);

  return (
    <section className="transactions">
      {/* {title !== "" && (
        <div className="py-2 mb-3">
          <h2 className="font-bold">{t("AllTransactions")}</h2>
        </div>
      )} */}
      <div className="shadow-md overflow-y-scroll rounded-lg">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            {transfer.fetchingData ? (
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <CircularProgress size={20} />
                <b style={{ paddingTop: 10 }}>{t("RefreshingList")} ...</b>
              </div>
            ) : (
              <>
                {showLess ? (
                  <TableBody>
                    {transfer.transfers &&
                      transfer.transfers
                        .slice(0, 3)
                        .map((row: any, index: number) => (
                          <TransactionListItem transaction={row} key={index} />
                        ))}
                  </TableBody>
                ) : (
                  <TableBody>
                    {transfer.transfers &&
                      transfer.transfers.map((row: any, index: number) => (
                        <TransactionListItem transaction={row} key={index} />
                      ))}
                  </TableBody>
                )}
              </>
            )}
          </Table>
        </TableContainer>
      </div>
      {title.length !== 0 && (
        <div className="py-2 px-2 border-b flex flex-row justify-between">
          <p className="my-2 font-semiBold"></p>
          <nav aria-label="Page navigation example">
            <ul className="pagination">
              <li className="page-item">
                <small className="page-link" onClick={fetchPrevious}>
                  <i className="fa fa-angle-left"></i>
                </small>
              </li>
              <li className="page-item">
                <small className="page-link font-bold">{transfer.page}</small>
              </li>
              <li className="page-item">
                <small className="page-link" onClick={fetchNext}>
                  <i className="fa fa-angle-right"></i>
                </small>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </section>
  );
};

export default TransactionsCard;
