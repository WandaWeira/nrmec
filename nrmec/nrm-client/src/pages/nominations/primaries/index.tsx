import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { ChevronRight, FileText } from "lucide-react";

const PrimariesNominationsIndex: React.FC = () => {
  const levels = [
    {
      name: "National Level",
      path: "/nominations/primaries/national",
      description: "Manage nominations for national level primaries elections",
    },
    {
      name: "District Level",
      path: "/nominations/primaries/district",
      description: "Manage nominations for district level primaries elections",
    },
    {
      name: "Constituency/Municipality Level",
      path: "/nominations/primaries/constituency-municipality",
      description:
        "Manage nominations for constituency/municipality level primaries elections",
    },
    {
      name: "Subcounty/Division Level",
      path: "/nominations/primaries/subcounty-division",
      description:
        "Manage nominations for subcounty/division level primaries elections",
    },
    {
      name: "Parish/Ward Level",
      path: "/nominations/primaries/parish-ward",
      description:
        "Manage nominations for parish/ward level primaries elections",
    },
    {
      name: "Village/Cell Level",
      path: "/nominations/primaries/village-cell",
      description:
        "Manage nominations for village/cell level primaries elections",
    },
  ];

  return (
    <div>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          NRM Primaries Nominations
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Select an administrative level to manage nominations for primaries
          elections.
        </Typography>
      </Box>

      {/* Reports Section */}
      <Box mb={4}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          className="flex items-center gap-2"
        >
          <FileText className="h-6 w-6" />
          Reports & Analytics
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderLeft: "4px solid #1976d2",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Nominations Report
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Comprehensive report of all nominated candidates across
                  different administrative levels for primaries elections.
                </Typography>
              </CardContent>
              <Box p={2} display="flex" justifyContent="flex-end">
                <Button
                  component={Link}
                  to="/nominations/primaries/report"
                  variant="contained"
                  color="primary"
                  endIcon={<ChevronRight size={16} />}
                >
                  View Report
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Administrative Levels Section */}
      <Box mb={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Administrative Levels
        </Typography>

        <Grid container spacing={3}>
          {levels.map((level) => (
            <Grid item xs={12} sm={6} md={4} key={level.path}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {level.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {level.description}
                  </Typography>
                </CardContent>
                <Box p={2} display="flex" justifyContent="flex-end">
                  <Button
                    component={Link}
                    to={level.path}
                    variant="contained"
                    color="primary"
                    endIcon={<ChevronRight size={16} />}
                  >
                    Access
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};

export default PrimariesNominationsIndex;
