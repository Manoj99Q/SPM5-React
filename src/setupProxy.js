const { createProxyMiddleware } = require("http-proxy-middleware");

/*
This acts a proxy between the react application and the flask microservice
Everytime there is a request to /api, the setupProxy prepends the flask
microservice url
*/
module.exports = function (app) {
  // Directly use the deployed Flask URL for cloud testing
  const targetUrl = "https://flask-asign5-323579180404.us-central1.run.app";

  console.log("Using Flask API URL:", targetUrl);

  app.use(
    "/api",
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
    })
  );
};
