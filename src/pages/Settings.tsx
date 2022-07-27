import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";

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
    backgroundColor: "#fff",
  },
  mainContent: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f1f1f1",
    minHeight: 600,
  },
});

const Settings: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Paper className={classes.header}>
        <h2>
          <b>Settings</b>
        </h2>
      </Paper>
      <div className={classes.mainContent}>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione non
          necessitatibus quasi quibusdam odit placeat dolorem temporibus
          aspernatur pariatur nemo dicta ab, ipsam nisi, exercitationem modi
          voluptatibus explicabo est harum eum, tenetur architecto ipsa adipisci
          amet! Ullam voluptate, saepe deleniti voluptas porro dolor debitis
          culpa officia ab ratione, dolorum dolore? Repudiandae laborum ipsa
          dicta cumque dolorem earum quasi, nam maxime voluptatibus eum
          voluptate illo quibusdam aperiam animi inventore reiciendis aspernatur
          repellendus ea tenetur? Laborum inventore quae unde at.
        </p>
      </div>
    </div>
  );
};

export default Settings;
