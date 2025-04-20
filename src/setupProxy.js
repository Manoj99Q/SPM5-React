const { createProxyMiddleware } = require("http-proxy-middleware");

/*
This acts a proxy between the react application and the flask microservice
Everytime there is a request to /api, the setupProxy prepends the flask
microservice url mentioned in line 14
*/
module.exports = function (app) {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Use flask-service (Docker service name) in development, otherwise use cloud URL
  const targetUrl = isDevelopment
    ? "http://flask-service:5000"
    : "https://flask-asign5-323579180404.us-central1.run.app";

  app.use(
    "/api",
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
    })
  );

  // Add proxy for static image files from LSTM service
  // This routes requests for /static/images/* to the LSTM service
  if (isDevelopment) {
    app.use(
      "/static/images",
      createProxyMiddleware({
        target: "http://lstm-service:8080",
        changeOrigin: true,
      })
    );
  }
};
