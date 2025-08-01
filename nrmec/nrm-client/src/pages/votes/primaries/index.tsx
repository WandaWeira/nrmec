import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Button, Box } from "@mui/material";
import { ChevronRight } from "lucide-react";

const PrimariesVotesIndex: React.FC = () => {
  const levels = [
    {
      title: "National Level",
      path: "/votes/primaries/national",
      description: "Record votes for national level positions in NRM primaries",
      color: "#1976d2",
    },
    {
      title: "District Level", 
      path: "/votes/primaries/district",
      description: "Record votes for district level positions in NRM primaries",
      color: "#388e3c",
    },
    {
      title: "Constituency/Municipality Level",
      path: "/votes/primaries/constituency-municipality", 
      description: "Record votes for constituency and municipality positions in NRM primaries",
      color: "#f57c00",
    },
    {
      title: "Subcounty/Division Level",
      path: "/votes/primaries/subcounty-division",
      description: "Record votes for subcounty and division positions in NRM primaries", 
      color: "#7b1fa2",
    },
    {
      title: "Parish/Ward Level",
      path: "/votes/primaries/parish-ward",
      description: "Record votes for parish and ward positions in NRM primaries",
      color: "#c2185b",
    },
    {
      title: "Village/Cell Level",
      path: "/votes/primaries/village-cell", 
      description: "Record votes for village and cell positions in NRM primaries",
      color: "#d32f2f",
    },
  ];

  return (
    <div>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Primaries Votes Management
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Select the administrative level to record votes for nominated candidates in NRM primary elections.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {levels.map((level) => (
          <Grid item xs={12} md={6} lg={4} key={level.path}>
            <Card 
              sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                transition: "transform 0.3s, box-shadow 0.3s",
                borderTop: `4px solid ${level.color}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px 0 rgba(0,0,0,0.15)"
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                  {level.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {level.description}
                </Typography>
              </CardContent>
              
              <Box p={2} pt={0}>
                <Button 
                  component={Link}
                  to={level.path}
                  variant="contained"
                  fullWidth
                  size="small"
                  sx={{ 
                    backgroundColor: level.color,
                    "&:hover": {
                      backgroundColor: level.color,
                      filter: "brightness(0.9)"
                    }
                  }}
                  endIcon={<ChevronRight />}
                >
                  Manage Votes
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default PrimariesVotesIndex;
