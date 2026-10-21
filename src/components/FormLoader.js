import React from "react";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import { useModulesManager, useTranslations } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";

const FormLoader = () => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  return (
    <Box display="flex" alignItems="center" justifyContent="center" py={4} style={{ gap: 12 }}>
      <CircularProgress size={24} />
      <Typography variant="body2" color="textSecondary">
        {formatMessage("form.preparing")}
      </Typography>
    </Box>
  );
};

export default FormLoader;
