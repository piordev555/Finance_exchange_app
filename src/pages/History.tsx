import React, { useState, useEffect } from "react";
import TransactionsCard from "../components/TransactionsCard/TransactionsCard";
import { getTransfers } from "../store/features/Transfer/Transfer";
import {
  fetchTransferRecords,
  updatePage,
} from "../store/features/Transfer/TransferSlice";
import { useAppSelector, useAppDispatch } from "../store/hooks";

const History: React.FC = () => {
  const { transfers, page } = useAppSelector(
    (state) => state.persistedReducer.transfer
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const dispatch = useAppDispatch();

  const getAllUserTransfer = (page: any) => {
    getTransfers(page)
      .then((res: any) => {
        dispatch(updatePage(res.current_page));
        dispatch(fetchTransferRecords(res.data));
      })
      .catch((error) => {
        getTransfers(page).then((res) =>
          dispatch(fetchTransferRecords(res.data))
        );
      });
  };

  useEffect(() => {
    getAllUserTransfer(page);
  }, [dispatch]);

  return (
    <TransactionsCard
      transactions={transfers}
      fetchNext={() => getAllUserTransfer(page + 1)}
      fetchPrevious={() => getAllUserTransfer(page - 1)}
      title="All Transactions"
    />
  );
};

export default History;
