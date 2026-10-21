import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Form } from "@openimis/fe-core";

// fe-core Form draws its own card; inside the tabbed page card that doubles the shadow
const useStyles = makeStyles(() => ({
  root: {
    "& > form > .MuiGrid-container > .MuiGrid-item > .MuiPaper-root": { boxShadow: "none" },
  },
}));

const FlatForm = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Form {...props} />
    </div>
  );
};

export default FlatForm;
