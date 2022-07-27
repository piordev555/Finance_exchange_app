import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import {
  BeneListItem,
  BeneListItemHeader,
} from "../components/BeneListItem/BeneListItem";
import Pagination from "@material-ui/lab/Pagination";
import ButtonComponent from "../components/ButtonComponent";

const benes: Beneficiary[] = [
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
  {
    name: "katende hakim",
    company: "Danapay",
    email: "katende@danapay.io",
    phone: "+25678817712",
    country: "Uganda",
    verification: false,
    rating: 4,
  },
];

const useStyles = makeStyles({
  root: {
    width: "calc(100% - 10px)",
    height: "calc(100vh - 10px)",
    margin: 5,
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    width: "100%",
    padding: 10,
  },
  mainContent: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f1f1f1",
    minHeight: 600,
  },
  list: {
    backgroundColor: "#fff",
  },
  pagination: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  select: {
    height: 46,
    width: 300,
    outline: "none",
    border: "1px solid #eee",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
  },
});

const Beneficiaries: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.header}>
        <div className="flex justify-between shadow-sm-md mb-1 p-2">
          <h1>
            <b>Beneficiaries</b>
          </h1>
          <div className="addBtnSection">
            <ButtonComponent
              btnText="Add new Beneficiary"
              onClick={() => alert(0)}
              icon={
                <i
                  className="fa fa-plus-circle"
                  aria-hidden="true"
                  style={{ fontSize: 13 }}
                ></i>
              }
            />
          </div>
        </div>

        <div className="flex  items-center w-300 p-2">
          <div className="mr-10">
            <b>Search</b>
          </div>
          <select className={classes.select}>
            <option>From</option>
            <option>option1</option>
            <option>option2</option>
            <option>option3</option>
          </select>
        </div>
      </Paper>
      <div className={classes.mainContent}>
        <div className={classes.list}>
          <BeneListItemHeader />
          {benes.map((ben) => (
            <BeneListItem beneficiary={ben} />
          ))}
        </div>
        <div className={classes.pagination}>
          <Pagination
            count={benes.length}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </div>
      </div>
    </div>
  );
};

export default Beneficiaries;
