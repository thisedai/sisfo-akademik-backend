const createError = require("http-errors");
const express = require("express");
const moment = require("moment");
// const lodash = require("lodash");
// const json2csv = require("json2csv");
const modelFilterDashboard = require("../models/modelFilterDashboard");

const router = express.Router();

router.get("/", function (req, res) {
  //   res.send("halo stmt");
  res.send({
    status: 200,
    data: "halo filter",
  });
});

// region
router.get("/region", async (req, res, next) => {
  let trade_type_id = 1;
  let region_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek id
  if ("id" in req.query) {
    region_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.region(trade_type_id, region_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    //   console.log( error );
    res.send({
      status: 500,
      data: error,
    });
  }
});

// area
router.get("/area", async (req, res, next) => {
  let trade_type_id = 1;
  let region_id = -1;
  let area_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek region
  if ("region" in req.query) {
    region_id = req.query.region;
  }

  //   cek id
  if ("id" in req.query) {
    area_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.area(trade_type_id, region_id, area_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    //   console.log( error );
    res.send({
      status: 500,
      data: error,
    });
  }
});

// city
router.get("/city", async (req, res, next) => {
  let trade_type_id = 1;
  let region_id = -1;
  let area_id = -1;
  let city_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek region
  if ("region" in req.query) {
    region_id = req.query.region;
  }

  //   cek area
  if ("area" in req.query) {
    area_id = req.query.area;
  }

  //   cek id
  if ("id" in req.query) {
    city_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.city(trade_type_id, region_id, area_id, city_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// surveyor
router.get("/surveyor", async (req, res, next) => {
  let trade_type_id = 1;
  let region_id = -1;
  let area_id = -1;
  let city_id = -1;
  let surveyor_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek region
  if ("region" in req.query) {
    region_id = req.query.region;
  }

  //   cek area
  if ("area" in req.query) {
    area_id = req.query.area;
  }

  //   cek city
  if ("city" in req.query) {
    city_id = req.query.city;
  }

  //   cek id
  if ("id" in req.query) {
    surveyor_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.surveyor(trade_type_id, region_id, area_id, city_id, surveyor_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// distributor
router.get("/distributor", async (req, res, next) => {
  let trade_type_id = 1;
  let region_id = -1;
  let area_id = -1;
  let distributor_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek region
  if ("region" in req.query) {
    region_id = req.query.region;
  }

  //   cek area
  if ("area" in req.query) {
    area_id = req.query.area;
  }

  //   cek id
  if ("id" in req.query) {
    distributor_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.distributor(trade_type_id, region_id, area_id, distributor_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// re
router.get("/re", async (req, res, next) => {
  let trade_type_id = 1;
  let re_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek id
  if ("id" in req.query) {
    re_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.re(trade_type_id, re_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

// account
router.get("/account", async (req, res, next) => {
  let trade_type_id = 1;
  let re_id = -1;
  let account_id = -1;

  //   cek trade
  if ("trade" in req.query) {
    trade_type_id = req.query.trade;
  }

  //   cek re
  if ("re" in req.query) {
    re_id = req.query.re;
  }

  //   cek id
  if ("id" in req.query) {
    account_id = req.query.id;
  }

  try {
    const respon = await modelFilterDashboard.account(trade_type_id, re_id, account_id);

    res.send({ status: 200, data: respon });
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      data: error,
    });
  }
});

module.exports = router;
