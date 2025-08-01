import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Button, Box } from "@mui/material";
import { ChevronRight } from "lucide-react";

const NominationsIndex: React.FC = () => {
  const nominationTypes = [
    {
      title: "Primaries Nominations",
      path: "/nominations/primaries",
      description: "Manage nominations for NRM primary elections at different administrative levels",
      color: "#1976d2", // Blue
    },
    {
      title: "Internal Party Nominations",
      path: "/nominations/internal-party",
      description: "Manage nominations for NRM internal party positions at different administrative levels",
      color: "#2e7d32", // Green
    },
  ];

  return (
    <div>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          NRM Elections Nominations
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Select the type of nominations you want to manage. Nominations are the process of formally approving 
          candidates who have paid their fees for their respective positions.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {nominationTypes.map((type) => (
          <Grid item xs={12} md={6} key={type.path}>
            <Card 
              sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                transition: "transform 0.3s, box-shadow 0.3s",
                borderTop: `4px solid ${type.color}`,
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 20px 0 rgba(0,0,0,0.15)"
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  {type.title}
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  {type.description}
                </Typography>
                <Button 
                  component={Link} 
                  to={type.path} 
                  variant="contained" 
                  size="large"
                  fullWidth
                  sx={{ backgroundColor: type.color }}
                  endIcon={<ChevronRight />}
                >
                  Manage {type.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default NominationsIndex;
