import React from "react";
import { Box } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import { lighten, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: ({ severity, neutral }) => {
    const { main, dark } = theme.palette[severity];
    return neutral
      ? { backgroundColor: theme.palette.grey[100], border: `1px solid ${theme.palette.grey[300]}`, color: dark }
      : { backgroundColor: lighten(main, 0.9), border: `1px solid ${lighten(main, 0.8)}` };
  },
  message: { flexGrow: 1 },
  title: { fontWeight: 600 },
}));

const ImportStatusAlert = ({ severity, neutral = false, title, actions, footer, children }) => {
  const classes = useStyles({ severity, neutral });
  return (
    <Alert
      severity={severity}
      icon={neutral ? false : undefined}
      classes={{ root: classes.root, message: classes.message }}
    >
      <Box display="flex" alignItems="flex-start" style={{ gap: 16 }}>
        <Box flexGrow={1}>
          <AlertTitle className={classes.title}>{title}</AlertTitle>
          {children}
        </Box>
        {actions && (
          <Box display="flex" flexShrink={0} style={{ gap: 8 }}>
            {actions}
          </Box>
        )}
      </Box>
      {footer}
    </Alert>
  );
};

export default ImportStatusAlert;
