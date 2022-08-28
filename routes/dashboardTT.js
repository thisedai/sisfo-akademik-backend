const createError = require("http-errors");
const express = require("express");
// const moment = require("moment");
// const lodash = require("lodash");
// const json2csv = require("json2csv");
const modelDashboardTT = require("../models/modelDashboardTT");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("halo");
});

// default map
router.post("/getDefaultMap", async (req, res, next) => {
  try {
    const body = req.body.filter;
    // body.select = "any(area_id) as ID, any(area_name) as nama, any(latitude) as latitude, any(longitude) as longitude";
    body.select =
      "any(area_id) as ID, any(area_name) as nama, any(latitude) as latitude, any(longitude) as longitude, any(toMonth(tanggal)) as bulan, any(toYear(tanggal)) as tahun, any(store_id) as store_id";
    body.group_by = "area_id";

    const result = await modelDashboardTT.getDataMap(body);
    res.send({
      status: 200,
      data: { map: result.data },
    });
  } catch (error) {
    res.send({
      status: 500,
      data: error,
    });
  }
});

// map by area
router.post("/viewMapByArea", async (req, res, next) => {
  try {
    const body = req.body.filter;
    // body.select =
    //   "any(account_id) as id_account, any(area_id) as id_area, any(area_name) as name_area, any(city_name) as name_city, any(latitude) as latitude, any(longitude) as longitude, any(total_score) as level, any(region_name) as name_region, any(store_code) as code_store, any(store_name) as name_store, any(store_id) as id_store, any(sku_ideal_score) as sku_ideal_score, any(posm_ideal_score) as posm_ideal_score, any(display_ideal_score) as display_ideal_score, any(toMonth(tanggal)) as bulan, any(toYear(tanggal)) as tahun ";

    body.select =
      "any(account_id) as id_account, any(area_id) as id_area, any(area_name) as name_area, any(city_name) as name_city, any(latitude) as latitude, any(longitude) as longitude, max(total_score) as level, any(region_name) as name_region, any(store_code) as code_store, any(store_name) as name_store, any(store_id) as id_store, max(sku_ideal_score) as sku_ideal_score, max(posm_ideal_score) as posm_ideal_score, max(display_ideal_score) as display_ideal_score, any(toMonth(tanggal)) as bulan, any(toYear(tanggal)) as tahun, store_id";
    body.group_by = "store_id";

    const result = await modelDashboardTT.getDataMap(body);
    res.send({
      status: 200,
      data: { map: result.data },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// p7store chart
router.post("/getP7Store", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getP7Store(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// table p7 store
router.post("/getStoreListByScore", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getStoreList(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { table: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// table visit store
router.post("/getStoreListByVisit", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getStoreListByVisit(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { table: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getP7Component
router.post("/getP7Component", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getP7Component(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { component: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getTrendChart
router.post("/getTrendChart", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getTrendChart(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { value: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getIdealScoreRECategory
router.post("/getIdealScoreRECategory", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getIdealScoreRECategory(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { component: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getScoreAvailability
router.post("/getScoreAvailability", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getScoreAvailability(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getIdealPerformance
router.post("/getIdealPerformance", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getIdealPerformance(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// --------------------------- selout ----------------------------

// getSelloutComponent
router.post("/getSelloutComponent", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getSelloutComponent(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { component: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getSellOutPerformance
router.post("/getSellOutPerformance", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getSellOutPerformance(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { component: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// getSellOutTrendChart
router.post("/getSellOutTrendChart", async (req, res, next) => {
  try {
    const body = req.body.filter;
    const result = await modelDashboardTT.getSellOutTrendChart(body);
    // console.log(result);
    res.send({
      status: 200,
      data: { component: result },
    });
  } catch (error) {
    // console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

module.exports = router;
