import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Button, Box } from "@mui/material";
import { ChevronRight } from "lucide-react";

const GeneralElectionsIndex: React.FC = () => {
  return (
    <div>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          General Elections
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track and manage general election data for NRM candidates running against opposition candidates.
          Record votes, manage opposition candidates, and view comparative performance statistics.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card 
            sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column",
              transition: "transform 0.3s, box-shadow 0.3s",
              borderTop: "4px solid #d32f2f", // Red color for general elections
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 20px 0 rgba(0,0,0,0.15)"
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                General Elections Management
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Track NRM candidates against opposition candidates in general elections. Record votes, manage opposition candidate data, 
                and analyze performance at various administrative levels.
              </Typography>
            </CardContent>
            
            <Box p={2} pt={0}>
              <Button 
                component={Link}
                to="/general-elections/village-cell"
                variant="contained"
                fullWidth
                sx={{ 
                  backgroundColor: "#d32f2f", // Red color
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                    filter: "brightness(0.9)"
                  }
                }}
                endIcon={<ChevronRight />}
              >
                Manage General Elections
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default GeneralElectionsIndex;
