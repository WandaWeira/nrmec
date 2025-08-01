import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Button, Box } from "@mui/material";
import { ChevronRight } from "lucide-react";

const VotesIndex: React.FC = () => {
  const voteTypes = [
    {
      title: "Primaries Votes",
      path: "/votes/primaries",
      description: "Record and manage votes for nominated candidates in NRM primary elections",
      color: "#1976d2", // Blue
    },
    {
      title: "Internal Party Votes",
      path: "/votes/internal-party",
      description: "Record and manage votes for nominated candidates in NRM internal party elections",
      color: "#2e7d32", // Green
    },
  ];

  return (
    <div>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          NRM Elections Votes
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Select the type of election votes you want to manage. Vote recording allows you to enter 
          vote counts for nominated candidates at different administrative levels.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {voteTypes.map((type) => (
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
                <Typography variant="body1" color="textSecondary" paragraph>
                  {type.description}
                </Typography>
              </CardContent>
              
              <Box p={2} pt={0}>
                <Button 
                  component={Link}
                  to={type.path}
                  variant="contained"
                  fullWidth
                  sx={{ 
                    backgroundColor: type.color,
                    "&:hover": {
                      backgroundColor: type.color,
                      filter: "brightness(0.9)"
                    }
                  }}
                  endIcon={<ChevronRight />}
                >
                  Manage {type.title}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default VotesIndex;
