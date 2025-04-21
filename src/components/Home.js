/*
Goal of React:
  1. React will retrieve GitHub created and closed issues for a given repository and will display the bar-charts 
     of same using high-charts        
  2. It will also display the images of the forecasted data for the given GitHub repository and images are being retrieved from 
     Google Cloud storage
  3. React will make a fetch api call to flask microservice.
*/

// Import required libraries
import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// Import custom components
import BarCharts from "./BarCharts";
import Loader from "./Loader";
import {
  ListItemButton,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";

const drawerWidth = 240;
// List of GitHub repositories
const repositories = [
  {
    key: "meta-llama/llama3",
    value: "Llama 3",
  },
  {
    key: "ollama/ollama",
    value: "Ollama",
  },
  {
    key: "langchain-ai/langchain",
    value: "LangChain",
  },
  {
    key: "langchain-ai/langgraph",
    value: "LangGraph",
  },
  {
    key: "microsoft/autogen",
    value: "Microsoft AutoGen",
  },
  {
    key: "openai/openai-cookbook",
    value: "OpenAI Cookbook",
  },
  {
    key: "elastic/elasticsearch",
    value: "Elasticsearch",
  },
  {
    key: "milvus-io/pymilvus",
    value: "PyMilvus",
  },
];

export default function Home() {
  /*
  The useState is a react hook which is special function that takes the initial 
  state as an argument and returns an array of two entries. 
  */
  /*
  setLoading is a function that sets loading to true when we trigger flask microservice
  If loading is true, we render a loader else render the Bar charts
  */
  const [loading, setLoading] = useState(true);
  /* 
  setRepository is a function that will update the user's selected repository such as Angular,
  Angular-cli, Material Design, and D3
  The repository "key" will be sent to flask microservice in a request body
  */
  const [repository, setRepository] = useState({
    key: "meta-llama/llama3",
    value: "Llama 3",
  });
  /*
  
  The first element is the initial state (i.e. githubRepoData) and the second one is a function 
  (i.e. setGithubData) which is used for updating the state.

  so, setGitHub data is a function that takes the response from the flask microservice 
  and updates the value of gitHubrepo data.
  */
  const [githubRepoData, setGithubData] = useState([]);
  // Add a new state for managing active tab
  const [activeTab, setActiveTab] = useState("issues");
  // Add new state for model selection
  const [forecastModel, setForecastModel] = useState("lstm");

  // Updates the repository to newly selected repository
  const eventHandler = (repo) => {
    setRepository(repo);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    fetchData(newValue, forecastModel);
  };

  // Handle model selection change
  const handleModelChange = (event) => {
    setForecastModel(event.target.value);
    fetchData(activeTab, event.target.value);
  };

  // Separate function to fetch data
  const fetchData = (dataType, modelType) => {
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Include repository, dataType, and modelType in the request
      body: JSON.stringify({
        repository: repository.key,
        dataType: dataType,
        modelType: modelType,
      }),
    };

    fetch("/api/github", requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          setLoading(false);
          setGithubData(result);
        },
        (error) => {
          console.log(error);
          setLoading(false);
          setGithubData([]);
        }
      );
  };

  /* 
  Fetch the data from flask microservice on Component load and on update of new repository.
  Now we also specify which data type to fetch (issues or pulls) and which model to use
  */
  React.useEffect(() => {
    fetchData(activeTab, forecastModel);
  }, [repository]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Application Header */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Timeseries Forecasting V3
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Left drawer of the application */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {/* Iterate through the repositories list */}
            {repositories.map((repo) => (
              <ListItem
                button
                key={repo.key}
                onClick={() => eventHandler(repo)}
                disabled={loading && repo.value !== repository.value}
              >
                <ListItemButton selected={repo.value === repository.value}>
                  <ListItemText primary={repo.value} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        {/* Add tabs for different data types */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Issues" value="issues" />
          <Tab label="Pull Requests" value="pulls" />
          {/* Add more tabs here in the future if needed */}
        </Tabs>

        {/* Add model selection radio buttons */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Forecast Model</FormLabel>
          <RadioGroup
            row
            name="forecast-model"
            value={forecastModel}
            onChange={handleModelChange}
          >
            <FormControlLabel
              value="lstm"
              control={<Radio />}
              label="LSTM (Deep Learning)"
            />
            <FormControlLabel
              value="statsmodel"
              control={<Radio />}
              label="Statsmodel (ARIMA)"
            />
          </RadioGroup>
        </FormControl>

        {/* Render loader component if loading is true else render charts and images */}
        {loading ? (
          <Loader />
        ) : (
          <div>
            {/* Show Issues tab content */}
            {activeTab === "issues" && (
              <div>
                {/* Render barchart component for monthly created issues */}
                <BarCharts
                  title={`Monthly Created Issues for ${repository.value} in last 1 year`}
                  data={githubRepoData?.created}
                />
                {/* Render barchart component for monthly closed issues */}
                <BarCharts
                  title={`Monthly Closed Issues for ${repository.value} in last 1 year`}
                  data={githubRepoData?.closed}
                />
                <Divider
                  sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
                />
                {/* Rendering Timeseries Forecasting of Created Issues */}
                <div>
                  <Typography variant="h5" component="div" gutterBottom>
                    Timeseries Forecasting of Created Issues using{" "}
                    {forecastModel === "lstm"
                      ? "Tensorflow and Keras LSTM"
                      : "Statsmodels ARIMA"}{" "}
                    based on past month
                  </Typography>

                  <div>
                    <Typography component="h4">
                      Model {forecastModel === "lstm" ? "Loss" : "Diagnostics"}{" "}
                      for Created Issues
                    </Typography>
                    <img
                      src={
                        githubRepoData?.createdAtImageUrls?.model_loss_image_url
                      }
                      alt={`Model ${
                        forecastModel === "lstm" ? "Loss" : "Diagnostics"
                      } for Created Issues`}
                      loading={"lazy"}
                    />
                  </div>
                  <div>
                    <Typography component="h4">
                      {forecastModel === "lstm" ? "LSTM" : "Statsmodel"}{" "}
                      Generated Data for Created Issues
                    </Typography>
                    <img
                      src={
                        githubRepoData?.createdAtImageUrls
                          ?.lstm_generated_image_url
                      }
                      alt={`${
                        forecastModel === "lstm" ? "LSTM" : "Statsmodel"
                      } Generated Data for Created Issues`}
                      loading={"lazy"}
                    />
                  </div>
                  <div>
                    <Typography component="h4">
                      All Issues Data for Created Issues
                    </Typography>
                    <img
                      src={
                        githubRepoData?.createdAtImageUrls
                          ?.all_issues_data_image
                      }
                      alt={"All Issues Data for Created Issues"}
                      loading={"lazy"}
                    />
                  </div>
                </div>
                {/* Rendering Timeseries Forecasting of Closed Issues */}
                <div>
                  <Divider
                    sx={{
                      borderBlockWidth: "3px",
                      borderBlockColor: "#FFA500",
                    }}
                  />
                  <Typography variant="h5" component="div" gutterBottom>
                    Timeseries Forecasting of Closed Issues using{" "}
                    {forecastModel === "lstm"
                      ? "Tensorflow and Keras LSTM"
                      : "Statsmodels ARIMA"}{" "}
                    based on past month
                  </Typography>

                  <div>
                    <Typography component="h4">
                      Model {forecastModel === "lstm" ? "Loss" : "Diagnostics"}{" "}
                      for Closed Issues
                    </Typography>
                    <img
                      src={
                        githubRepoData?.closedAtImageUrls?.model_loss_image_url
                      }
                      alt={`Model ${
                        forecastModel === "lstm" ? "Loss" : "Diagnostics"
                      } for Closed Issues`}
                      loading={"lazy"}
                    />
                  </div>
                  <div>
                    <Typography component="h4">
                      {forecastModel === "lstm" ? "LSTM" : "Statsmodel"}{" "}
                      Generated Data for Closed Issues
                    </Typography>
                    <img
                      src={
                        githubRepoData?.closedAtImageUrls
                          ?.lstm_generated_image_url
                      }
                      alt={`${
                        forecastModel === "lstm" ? "LSTM" : "Statsmodel"
                      } Generated Data for Closed Issues`}
                      loading={"lazy"}
                    />
                  </div>
                  <div>
                    <Typography component="h4">
                      All Issues Data for Closed Issues
                    </Typography>
                    <img
                      src={
                        githubRepoData?.closedAtImageUrls?.all_issues_data_image
                      }
                      alt={"All Issues Data for Closed Issues"}
                      loading={"lazy"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Show Pull Requests tab content */}
            {activeTab === "pulls" && (
              <div>
                {/* Render barchart component for pull requests */}
                <BarCharts
                  title={`Monthly Pull Requests for ${repository.value} in last 1 year`}
                  data={githubRepoData?.pulls}
                />
                <Divider
                  sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
                />
                {/* Rendering Timeseries Forecasting of Pull Requests */}
                <div>
                  <Typography variant="h5" component="div" gutterBottom>
                    Timeseries Forecasting of Pull Requests using{" "}
                    {forecastModel === "lstm"
                      ? "Tensorflow and Keras LSTM"
                      : "Statsmodels ARIMA"}{" "}
                    based on past month
                  </Typography>

                  <div>
                    <Typography component="h4">
                      Model {forecastModel === "lstm" ? "Loss" : "Diagnostics"}{" "}
                      for Pull Requests
                    </Typography>
                    <img
                      src={githubRepoData?.pullsImageUrls?.model_loss_image_url}
                      alt={`Model ${
                        forecastModel === "lstm" ? "Loss" : "Diagnostics"
                      } for Pull Requests`}
                      loading={"lazy"}
                    />
                  </div>
                  <div>
                    <Typography component="h4">
                      {forecastModel === "lstm" ? "LSTM" : "Statsmodel"}{" "}
                      Generated Data for Pull Requests
                    </Typography>
                    <img
                      src={
                        githubRepoData?.pullsImageUrls?.lstm_generated_image_url
                      }
                      alt={`${
                        forecastModel === "lstm" ? "LSTM" : "Statsmodel"
                      } Generated Data for Pull Requests`}
                      loading={"lazy"}
                    />
                  </div>
                  <div>
                    <Typography component="h4">
                      All Issues Data for Pull Requests
                    </Typography>
                    <img
                      src={
                        githubRepoData?.pullsImageUrls?.all_issues_data_image
                      }
                      alt={"All Issues Data for Pull Requests"}
                      loading={"lazy"}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Box>
    </Box>
  );
}
