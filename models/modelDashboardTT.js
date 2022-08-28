// confgi
// const knex = require("knex");
const ch = require("../config/clickhouse");
const knex = require("../config/knex");
const moment = require("moment");
const php_array_column = require("locutus/php/array/array_column");
const php_array_count_values = require("locutus/php/array/array_count_values");
const php_array_sum = require("locutus/php/array/array_sum");
const php_array_key_exists = require("locutus/php/array/array_key_exists");
// const { default: knex } = require("knex");

// map
const getDataMap = async (filter) => {
  //   filter date
  const year = filter.year;
  const month = filter.month;
  const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
  const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

  //   filter lainnya
  const region = filter.region;
  const area = filter.area;
  const city = filter.city;
  const surveyor = filter.surveyor;
  const ltt = filter.ltt;
  const distributor = filter.distributor;
  const re = filter.re;
  const account = filter.account;
  const filter_p7 = typeof filter.filter_p7 != "undefined" ? filter.filter_p7 : -1;
  const area_id = typeof filter.area_id != "undefined" ? filter.area_id : -1;

  //   select - group by
  const select = typeof filter.select != "undefined" && filter.select != "" ? filter.select : " * ";
  const group_by = typeof filter.group_by != "undefined" && filter.group_by != "" ? ` group by ${filter.group_by}` : " ";

  //   where
  let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
  if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
  if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
  if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
  if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
  if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
  if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
  if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
  if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;
  if (filter_p7 != -1 && typeof filter_p7 != "undefined") extraCondition += ` AND total_score = ${filter_p7}`;
  if (area_id != -1 && typeof area_id != "undefined") extraCondition += ` AND area_id = ${area_id}`;

  //   query
  let query = `SELECT ${select} FROM chview_mpv_batch_per_visit_tt_v3 ${extraCondition} ${group_by}`;
  let query2 = `SELECT t1.*, photo.photo as photo  FROM(${query}) t1 LEFT JOIN chview_mpv_photo_store photo ON t1.store_id = photo.store_id AND t1.tahun = photo.tahun AND t1.bulan = photo.bulan`;
  // console.log(query2);
  let data = await ch.querying(query2);
  return data;
};

// getP7Store / getP6Store
const getP7Store = async (filter) => {
  try {
    //   filter date
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    let extraCondition2 = `WHERE bulan = ${month} AND tahun = ${year} `;
    if (region != -1 && typeof region != "undefined") {
      extraCondition += ` AND region_id = ${region}`;
      extraCondition2 += ` AND region_id = ${region}`;
    }
    if (area != -1 && typeof area != "undefined") {
      extraCondition += ` AND area_id = ${area}`;
      extraCondition2 += ` AND area_id = ${area}`;
    }
    if (city != -1 && typeof city != "undefined") {
      extraCondition += ` AND city_id = ${city}`;
      extraCondition2 += ` AND city_id = ${city}`;
    }
    if (surveyor != -1 && typeof surveyor != "undefined") {
      extraCondition += ` AND surveyor_id = ${surveyor}`;
      extraCondition2 += ` AND surveyor_id = ${surveyor}`;
    }
    if (ltt != -1 && typeof ltt != "undefined") {
      extraCondition += ` AND is_ltt = ${ltt}`;
      extraCondition2 += ` AND is_ltt = ${ltt}`;
    }
    if (distributor != -1 && typeof distributor != "undefined") {
      extraCondition += ` AND distributor_id = ${distributor}`;
      extraCondition2 += ` AND distributor_id = ${distributor}`;
    }
    if (re != -1 && typeof re != "undefined") {
      extraCondition += ` AND re_id = ${re}`;
      extraCondition2 += ` AND re_id = ${re}`;
    }
    if (account != -1 && typeof account != "undefined") {
      extraCondition += ` AND account_id = ${account}`;
      extraCondition2 += ` AND account_id = ${account}`;
    }

    let query = `SELECT any(bulan) as bulan,
                any(tahun)  as tahun,
                total_score,
                COUNT(1) as count_total_store
          FROM (
                  SELECT store_id,
                          max(total_score) as total_score,
                          any(toMonth(tanggal)) as bulan,
                          any(toYear(tanggal))  as tahun
                  FROM chview_mpv_batch_per_visit_tt_v3
                  ${extraCondition}
                  group by store_id

                  ) t1
          group by total_score`;

    const query2 = `SELECT count(1) as total
            FROM (select * from chview_mpv_store_list_tt ${extraCondition2} ) store
            LEFT JOIN (select any(store_id) as store_id2 from chview_mpv_batch_per_visit_tt_v3 where toMonth(tanggal) = ${month} and toYear(tanggal) = ${year} group by store_id) batch
            ON store.store_id = batch.store_id2
            WHERE batch.store_id2 is null`;

    // console.log(query);
    // the query
    let raw = await ch.querying(query);
    const raw2 = await ch.querying(query2);
    let result = raw.data;
    const result2 = raw2.data;

    let store = [];
    let p6;

    for (let i = 0; i <= 6; i++) {
      p6 = 0;
      result.forEach((row) => {
        if (row["total_score"] == i) {
          p6 = parseInt(row["count_total_store"]);
        }
      });
      store.push(p6);
    }

    const px = typeof result2[0]["total"] != "undefined" ? result2[0]["total"] : 0;
    store.push(parseInt(px));

    let dataExp = { store };
    return dataExp;
  } catch (error) {
    return error;
  }
};

// get table store by score
const getStoreList = async (filter) => {
  try {
    //   filter date
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");
    // console.log(filter);

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;
    const total_score = typeof filter.total_score != "undefined" ? filter.total_score : -1;

    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;
    if (total_score != -1 && typeof total_score != "undefined") extraCondition += ` AND total_score = ${total_score}`;

    const query2 = `
          select
              t1.store_id, t1.bulan, t1.tahun,
              t2.store_code,t2.store_name, t2.program_name, t2.last_visit_datetime, t2.region_name,
              t2.area_name, t2.city_name, t2.account_name, t2.source, t2.process,
              t1.distributor_name, t1.re_name
          from
              (
              SELECT
                store_id,
                any(store_code) as code_store,
                toYear(any(tanggal)) as tahun,
                toMonth(any(tanggal)) as bulan,
                any(store_name) as name_store,
                any(store_type) as type_store,
                any(region_name) as name_region,
                any(area_name) as name_area,
                any(city_name) as name_city,
                any(account_name) as name_account,
                any(last_visit) as visit_last,
                any(total_score) as score_total,
                any(distributor_name) as distributor_name,
                any(re_name) as re_name
              FROM
                chview_mpv_batch_per_visit_tt_v3
              ${extraCondition}
              group by
                store_id
              ) t1
          left join
              (
              select store_id, any(store_name) as store_name, any(store_code) as store_code,
                    any(type_store) as type_store, any(program_name) as program_name, max(last_visit_datetime) as last_visit_datetime,
                    any(region_name) as region_name, any(area_name) as area_name, any(city_name) as city_name, any(account_name) as account_name,
                    if(any(visit_is_accenture) = 1, 'Accenture', 'MPV') as source, 'Done' as process
              from chview_mpv_store_list_tt group by store_id
              ) t2 on t1.store_id = t2.store_id`;
    // console.log(query2);
    // the query
    let raw = await ch.querying(query2);
    return raw.data;
  } catch (error) {
    return error;
  }
};

const getStoreListByVisit = async (filter) => {
  //   filter date
  const year = filter.year;
  const month = filter.month;

  //   filter lainnya
  const region = filter.region;
  const area = filter.area;
  const city = filter.city;
  const surveyor = filter.surveyor;
  const ltt = filter.ltt;
  const distributor = filter.distributor;
  const re = filter.re;
  const account = filter.account;

  //   where
  // let extraCondition = ` WHERE (1) `;
  let extraCondition = `WHERE bulan = ${month} AND tahun = ${year} `;
  if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
  if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
  if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
  if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
  if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
  if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
  if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
  if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

  let query2 = `SELECT
                store_id, store_code, bulan, tahun,
                store_name, program_name, last_visit_datetime, region_name,
                area_name, city_name, account_name, if(is_accenture = 1, 'Accenture', 'MPV') as source, 'On Process' as process, distributor_name, re_name
            FROM (select * from chview_mpv_store_list_tt ${extraCondition} ) store
            LEFT JOIN (select any(store_id) as store_id2 from chview_mpv_batch_per_visit_tt_v3 where toMonth(tanggal) = ${month} and toYear(tanggal) = ${year} group by store_id) batch
            ON store.store_id = batch.store_id2
            WHERE batch.store_id2 is null`;
  try {
    console.log(query2);
    // clickhouse
    const raws = await ch.querying(`${query2}`);
    const result = raws.data;

    if (raws.rows > 0) {
      return result;
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
};

// getP7Component
const getP7Component = async (filter) => {
  try {
    //   filter date : range 2 bulan
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).add(-1, "months").format("YYYY-MM-DD"); // -1 bulan
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    // the query

    const query = `select
              (bulan) as bulan,
              (tahun) as tahun,
              round((max(sku_comply)/max(sku_all))*100, 2) as sku,
              round((max(disp_comply)/max(disp_all))*100, 2) as display,
              round((max(posm_comply)/max(posm_all))*100, 2) as posm,
              round((max(store_comply)/max(store_all))*100, 2) as store
        from(
        SELECT toMonth(any(tanggal))                                     as bulan,
              toYear(any(tanggal))                                      as tahun,
              count(1)                                                  as sku_all,
              sum(case when sku_ideal_score > 0 then 1 else 0 end)      as sku_comply,
              count(visit_id)                                           as posm_all,
              sum(case when posm_ideal_score > 0 then 1 else 0 end)     as posm_comply,
              count(visit_id)                                           as disp_all,
              sum(case when display_ideal_comply > 0 then 1 else 0 end) as disp_comply,
              count(visit_id)                                           as store_all,
              sum(case when store_comply > 0 then 1 else 0 end)         as store_comply
        FROM chview_mpv_batch_per_visit_tt_v3
        ${extraCondition}
        group by toMonth(tanggal), toYear(tanggal)) t1
        group by bulan, tahun
        order by tahun desc , bulan desc`;

    // console.log(query);
    const raw = await ch.querying(query);
    const result = raw.data;

    // console.log(result);

    let sku_mtd = 0,
      sku_lm = 0,
      disp_mtd = 0,
      disp_lm = 0,
      posm_mtd = 0,
      posm_lm = 0,
      store_mtd = 0,
      store_lm = 0;

    result.forEach((val) => {
      if (val.bulan == month) {
        // mtd
        sku_mtd = val.sku;
        disp_mtd = val.display;
        posm_mtd = val.posm;
        store_mtd = val.store;
      } else {
        // lm
        sku_lm = val.sku;
        disp_lm = val.display;
        posm_lm = val.posm;
        store_lm = val.store;
      }
    });

    const dataExp = {
      sku_mtd,
      sku_lm,
      disp_mtd,
      disp_lm,
      posm_mtd,
      posm_lm,
      store_mtd,
      store_lm,
    };

    return dataExp;
  } catch (error) {
    return error;
  }
};

// getTrendChart;
const getTrendChart = async (filter) => {
  try {
    //   filter date : range 5 bulan
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).add(-5, "months").format("YYYY-MM-DD"); // -5 bulan
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    // hitung rang bulan
    let startDate = moment(startOfMonth, "YYYY-MM-DD");
    const endDate = moment(endOfMonth, "YYYY-MM-DD");
    const allMonthsInPeriod = [];

    while (startDate.isBefore(endDate)) {
      // let bln = parseInt(startDate.format("M"));
      let thnbln = startDate.format("YYYY-M");
      allMonthsInPeriod.push(thnbln);
      startDate = startDate.add(1, "month");
    }

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    const mode = filter.mode;

    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;

    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    const query = `select bulan,
                tahun,
                round((max(comply_data) / max(all_data)) * 100, 2)     as all,
                round((max(whs_comply) / max(whs_all)) * 100, 2)       as whs,
                round((max(retail_comply) / max(retail_all)) * 100, 2) as retail
          from (
                  SELECT toMonth(any(tanggal))                                      as bulan,
                          toYear(any(tanggal))                                       as tahun,
                          count(1)                                                   as all_data,
                          sum(if(${mode} > 0, 1, 0))                         as comply_data,
                          sum(if(flag_whs_retail = 1, 1, 0))                         as whs_all,
                          sum(if(flag_whs_retail = 1 and ${mode} > 0, 1, 0)) as whs_comply,
                          sum(if(flag_whs_retail = 2, 1, 0))                         as retail_all,
                          sum(if(flag_whs_retail = 2 and ${mode} > 0, 1, 0)) as retail_comply

                  FROM chview_mpv_batch_per_visit_tt_v3
                  ${extraCondition}
                  group by toYear(tanggal), toMonth(tanggal)
                  order by toYear(tanggal) asc, toMonth(tanggal) asc

                  ) t1
          group by bulan, tahun
          order by tahun desc , bulan desc`;

    // console.log(query);
    const raw = await ch.querying(query);
    const result = raw.data;

    const arr_month = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const _all_score = [];
    const _whs_score = [];
    const _retail_score = [];
    const _category = [];

    // loop bulan
    let bulan, tahun, _whs, _retail, _all, cate;
    allMonthsInPeriod.forEach((val_month) => {
      tahun_bulan = val_month.split("-");
      bulan = parseInt(tahun_bulan[1]);
      tahun = parseInt(tahun_bulan[0]);

      cate = `${arr_month[bulan]} ${tahun}`;

      _whs = 0;
      _retail = 0;
      _all = 0;

      result.forEach((val) => {
        if (val_month == `${val.tahun}-${val.bulan}`) {
          _whs = val.whs;
          _retail = val.retail;
          _all = val.all;
        }
      });

      _all_score.push(_all);
      _whs_score.push(_whs);
      _retail_score.push(_retail);
      _category.push(cate);
    });

    let category1 = "WHS Score";
    let category2 = "Retail Score";
    let category3 = "Total Score";

    const dataExp = {
      data: [
        {
          name: category1,
          data: _whs_score,
          color: "#e2871a",
        },
        {
          name: category2,
          data: _retail_score,
          color: "#4f2170",
        },
        {
          name: category3,
          data: _all_score,
          color: "#29781a",
        },
      ],
      category: _category,
    };

    return dataExp;
  } catch (error) {
    return error;
  }
};

// getIdealScoreRECategory;
const getIdealScoreRECategory = async (filter) => {
  try {
    //   filter date
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    const mode = filter.mode;

    // console.log(filter);
    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;

    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    // cek mode
    let result = [
      {
        name: "Whole Saler",
        data: [0, 0],
      },
      {
        name: "Retail",
        data: [0, 0],
      },
    ];

    if (mode == "display_ideal_comply") result = await RECategoryDisplay(extraCondition);
    if (mode == "store_comply") result = await RECategoryStore(extraCondition, mode);
    if (mode == "sku_ideal_score") result = await RECategoryStore(extraCondition, mode);
    if (mode == "posm_ideal_score") result = await RECategoryStore(extraCondition, mode);
    if (mode == "sellout") result = await RECategorySellout(filter, mode);

    // console.log(result);
    return result;
  } catch (error) {
    return error;
  }
};

// getScoreAvailability;
const getScoreAvailability = async (filter) => {
  try {
    // console.log("ok");
    //   filter date
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;
    // console.log(filter);
    const mode = filter.mode;

    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    const date_between = ` WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;

    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    // cek mode
    let result;
    if (mode == "sku_ideal_score") result = await AvailabilitySKUPOSM(extraCondition, mode, date_between);
    if (mode == "posm_ideal_score") result = await AvailabilityPOSM(extraCondition, mode);
    if (mode == "display_ideal_comply") result = await AvailabilityDisplay(extraCondition, mode);
    if (mode == "sellout") result = await AvailabilitySellOut(filter, mode);

    return result;
  } catch (error) {
    return error;
  }
};

// getIdealPerformance;
const getIdealPerformance = async (filter) => {
  try {
    //   filter date
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    const mode = filter.mode;

    //   where
    let extraCondition = `WHERE tanggal BETWEEN '${startOfMonth}' and '${endOfMonth}'`;

    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    // cek mode
    let result;
    if (mode == "sku_ideal_score") result = await PerformanceSKUPOSMDisp(extraCondition, mode);
    if (mode == "display_ideal_comply") result = await PerformanceSKUPOSMDisp(extraCondition, mode);
    if (mode == "posm_ideal_score") result = await PerformanceSKUPOSMDisp(extraCondition, mode);
    // console.log(result);
    return result;
  } catch (error) {
    return error;
  }
};

// ---------- sellout --------------------
// getSelloutComponent
const getSelloutComponent = async (filter) => {
  try {
    //   filter date : range 2 bulan
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).add(-1, "months").format("YYYY-MM-DD"); // -1 bulan
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    //   where
    let extraCondition = `WHERE tanggal_mulai BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    const query = `SELECT
          toMonth(any(tanggal_mulai)) as bulan,
          toYear(any(tanggal_mulai)) as tahun,
          sum(total_price) as total_price
        FROM
          chview_batch_report_selling_out_tt_v2
        ${extraCondition}
          AND role_id != 0
        group by
          toMonth(tanggal_mulai),
          toYear(tanggal_mulai)`;
    // console.log(query);
    const raw = await ch.querying(query);
    const result = raw.data;
    // console.log(result);

    if (raw.rows == 0) {
      const data = [{ mtd: 0 }, { lm: 0 }];
      return data;
    }
    //        proses
    const return_array = [];
    let _tmp;
    result.forEach((val) => {
      if (month == val["bulan"]) {
        // mtd
        _tmp = { mtd: parseFloat(val["total_price"]) };
        return_array.push(_tmp);
      } else {
        //  lm
        _tmp = { lm: parseFloat(val["total_price"]) };
        return_array.push(_tmp);
      }
    });
    return return_array;
  } catch (error) {
    return error;
  }
};

// getSellOutPerformance;
const getSellOutPerformance = async (filter) => {
  try {
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    //   where
    let extraCondition = `WHERE tanggal_mulai BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    const query2 = `
          select
              t2.*,
              ifnull(master.selling_out_target, 0) as target,
              case
                  when master.selling_out_target < 1 then 0
                  else round((t2.performance)/(master.selling_out_target) * 100,2)
              end as ach
          from
              (
              select
                  distributor_id,
                  any(distributor_name2) as distributor_name,
                  count(distributor_id) as distributor_active,
                  sum(price2) as performance,
                  ifnull(sum(ppkm_sold),0) as ppkm_sold,
                  ifnull(sum(total_price2),0) as budget
              from (
              select
                    ifnull(distributor_id, 0) as distributor_id,
                    toMonth(any(tanggal_mulai)) as bulan,
                    toYear(any(tanggal_mulai)) as tahun,
                    any(store_id) as store_id2,
                    any(distributor_name) as distributor_name2,
                    sum(price) as price2,
                    sum(package_ppkm) as ppkm_sold,
                    sum(total_price) as total_price2
              from chview_batch_report_selling_out_tt_v2 
              ${extraCondition} AND role_id != 0
              group by distributor_id, store_id
              ) t1
              group by distributor_id, tahun, bulan
              ) t2
          join (select distributor_id, sum(selling_out_target) as selling_out_target from chview_master_distributor_selling_out group by distributor_id) master on master.distributor_id = t2.distributor_id
          order by (distributor_id <> 0) desc, distributor_active desc`;

    // console.log(query2);
    const raw = await ch.querying(query2);
    const result = raw.data;
    // console.log(result);
    return result;
  } catch (error) {
    return error;
  }
};

// getSellOutTrendChart;
const getSellOutTrendChart = async (filter) => {
  try {
    //   filter date : range 5 bulan
    const year = filter.year;
    const month = filter.month;
    const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const startOfMonth = moment(_date).add(-11, "months").format("YYYY-MM-DD"); // -12 bulan
    const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

    //   filter lainnya
    const region = filter.region;
    const area = filter.area;
    const city = filter.city;
    const surveyor = filter.surveyor;
    const ltt = filter.ltt;
    const distributor = filter.distributor;
    const re = filter.re;
    const account = filter.account;

    //   where
    let extraCondition = `WHERE tanggal_mulai BETWEEN '${startOfMonth}' and '${endOfMonth}'`;
    if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
    if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
    if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
    if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
    if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
    if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
    if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
    if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

    const query2 = `select
          tahun,
          bulan,
          round((sum(performance) / sum(target)) * 100, 2) as ach,
          round((sum(t3.performance_whs) / sum(target)) * 100, 2) as ach_whs,
       round((sum(t3.performance_retail) / sum(target)) * 100, 2) as ach_retail
        from
          (
            select
              t2.*,
              ifnull(master.selling_out_target, 0) as target
            from
              (
                select
                  tahun, bulan, distributor_id,
                  sum(price2) as performance,
                  sum(if(flag_whs_retail = 1, price2, 0)) as performance_whs,
                  sum(if(flag_whs_retail = 2, price2, 0)) as performance_retail
                from
                  (
                    select
                        flag_whs_retail,
                      ifnull(distributor_id, 0) as distributor_id,
                      toMonth(any(tanggal_mulai)) as bulan,
                      toYear(any(tanggal_mulai)) as tahun,
                      sum(price) as price2,
                      sum(package_ppkm) as ppkm_sold,
                      sum(total_price) as total_price2
                    from
                      chview_batch_report_selling_out_tt_v2 
                    ${extraCondition} 
                      AND role_id != 0
                    group by
                      distributor_id, store_id,
                      toMonth(tanggal_mulai),
                      toYear(tanggal_mulai), flag_whs_retail
                  ) t1
                group by distributor_id, tahun, bulan
              ) t2
              left join (select distributor_id, sum(selling_out_target) as selling_out_target from chview_master_distributor_selling_out group by distributor_id) master on master.distributor_id = t2.distributor_id

          ) t3
        group by
          tahun,
          bulan
        order by tahun asc, bulan asc`;

    // console.log(query2);
    const raw = await ch.querying(query2);
    const result = raw.data;
    // console.log(result);
    const arr_month = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const _all_score = [];
    const _whs_score = [];
    const _retail_score = [];
    const _category = [];

    let nilai_all, nilai_whs, nilai_retail, cate, xt;

    result.forEach((val) => {
      _all_score.push(val.ach);
      _whs_score.push(val.ach_whs);
      _retail_score.push(val.ach_retail);
      cate = `${arr_month[val.bulan]} ${val.tahun}`;
      _category.push(cate);
    });

    let category1 = "WHS Score";
    let category2 = "Retail Score";
    let category3 = "Total Score";

    const dataExp = {
      data: [
        {
          name: category1,
          data: _whs_score,
          color: "#e2871a",
        },
        {
          name: category2,
          data: _retail_score,
          color: "#4f2170",
        },
        {
          name: category3,
          data: _all_score,
          color: "#29781a",
        },
      ],
      category: _category,
    };

    return dataExp;
  } catch (error) {
    return error;
  }
};

// ---------------------- protected module ----------------------------------------------------

const RECategoryDisplay = async (where) => {
  const query = `select *
              from (
                      select program_id,
                              program_name1                        as program_name,
                              comply,
                              all,
                              round((t1.comply / t1.all) * 100, 2) as ach
                      from (
                                select program_id,
                                      any(program_name)                       as program_name1,
                                      sum(if(display_ideal_comply > 0, 1, 0)) as comply,
                                      count(1)                                as all
                                from chview_mpv_batch_per_visit_tt_v3
                                ${where}
                                  and program_id != 0
                                  and program_name is not null
                                group by program_id
                                ) t1
                      order by ach desc, all desc
                      ) t2`;

  try {
    // console.log(query);
    const raws = await ch.querying(`${query}`);
    const result = raws.data;

    if (raws.rows > 0) {
      const _exp_category = result.map((val) => val.program_name);
      const _exp_data = result.map((val) => val.ach);
      const dataExp = {
        category: _exp_category,
        nilai: [{ data: _exp_data, showInLegend: false }],
      };
      // console.log(dataExp);
      return dataExp;
    } else {
      let xp = {
        category: ["NON MBD", "DIS KIWI", "DIS MAXI", "DIS MIDI", "CBD MIDI", "NON CBD", "CBD JUMBO", "DIS JUMBO", "CBD MAXI"],
        nilai: [
          {
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            showInLegend: false,
          },
        ],
      };
      return xp;
    }
  } catch (error) {
    return error;
  }
};

const RECategoryStore = async (where, mode) => {
  // get category from db
  const db_category_raws = await knex("category").where("is_active", 1);
  const db_category = db_category_raws.map((x) => x.category_id);

  const query = `select category_id,
              round((max(comply) / max(all)) * 100, 2)               as all,
              round((max(whs_comply) / max(whs_all)) * 100, 2)       as whs,
              round((max(retail_comply) / max(retail_all)) * 100, 2) as retail
        from (
                SELECT category_id,
                        flag_whs_retail,
                        sum(if(${mode} > 0, 1, 0))                         as comply,
                        count(1)                                                   as all,
                        sum(if(flag_whs_retail = 1, 1, 0))                         as whs_all,
                        sum(if(flag_whs_retail = 1 and ${mode} > 0, 1, 0)) as whs_comply,
                        sum(if(flag_whs_retail = 2, 1, 0))                         as retail_all,
                        sum(if(flag_whs_retail = 2 and ${mode} > 0, 1, 0)) as retail_comply
                FROM chview_mpv_batch_visit_tt_v3_raw
                ${where}
                group by category_id, flag_whs_retail
                ) t1
        group by category_id`;
  // console.log(query);
  const raw = await ch.querying(query);
  const result = raw.data;

  const _whs = [];
  const _retail = [];
  const _all = [];
  let dataExp = [];
  let __whs, __retail, __all;

  db_category.forEach((val_db) => {
    __whs = 0;
    __retail = 0;
    __all = 0;
    result.forEach((val) => {
      if (val_db == val.category_id) {
        __whs = val.whs;
        __retail = val.retail;
        __all = val.all;
      }
    });
    _whs.push(__whs);
    _retail.push(__retail);
    _all.push(__all);
  });

  dataExp = [
    {
      name: "Whole Saler",
      data: _whs,
    },
    {
      name: "Retail",
      data: _retail,
    },
    // {
    //   name: "All",
    //   data: _all,
    // },
  ];

  return dataExp;
};

const RECategorySellout = async (filter, mode) => {
  //   filter date
  const year = filter.year;
  const month = filter.month;
  const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
  const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

  //   filter lainnya
  const region = filter.region;
  const area = filter.area;
  const city = filter.city;
  const surveyor = filter.surveyor;
  const ltt = filter.ltt;
  const distributor = filter.distributor;
  const re = filter.re;
  const account = filter.account;

  //   where
  let extraCondition = `WHERE tanggal_mulai BETWEEN '${startOfMonth}' and '${endOfMonth}'`;

  if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
  if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
  if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
  if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
  if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
  if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
  if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
  if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

  const query2 = `SELECT
        any(visit_id) as visit_id,
        any(product_id) as product_id,
        any(product_name) as product_name,
        category_id,
        any(category_name) as category_name,
        ifnull(sum(total_price),0) as total_price,
        any(promo_name) as promo_name,
        case when promo_id = -1
        or promo_id is null then 0 else promo_id end as promo_id
      FROM
        chview_batch_report_selling_out_tt_v2
      ${extraCondition} and role_id != 0
      group by
        category_id,
        promo_id`;
  // console.log(query);
  const raw = await ch.querying(query2);
  const result = raw.data;

  const _no_promo = [];
  let _tmp;
  // by data
  result.forEach((val) => {
    // by promo id
    if (val["promo_id"] == 0) {
      // biskot
      if (val["category_id"] == 1) {
        _tmp = val["total_price"];
        _no_promo.push(_tmp);
      }
      // meals
      if (val["category_id"] == 2) {
        _tmp = val["total_price"];
        _no_promo.push(_tmp);
      }
      // choco
      if (val["category_id"] == 3) {
        _tmp = val["total_price"];
        _no_promo.push(_tmp);
      }
    }
  });

  const dataExp = [
    {
      name: "No Promo",
      data: _no_promo,
    },
  ];
  return dataExp;
};

const AvailabilityDisplay = async (where, mode) => {
  try {
    const query = `select *
          from chview_mpv_batch_per_visit_tt_v3
          ${where}
          and kpi_rules_id != 0
           `;

    // console.log(query);
    const raws = await ch.querying(query);
    const result = raws.data;
    // console.log(raws.rows);
    const KPI = await knex("mpv_kpi_tt_rules");
    // console.log(KPI);
    // return false;
    let dataExp = {
      category: ["tidak ada data"],
      nilai: [
        { name: "Whole Saler", data: [0] },
        { name: "Retailer", data: [0] },
        { name: "Chesse Store", data: [0] },
      ],
    };

    if (raws.rows > 0) {
      let target_tmp,
        target_kraft,
        target_frame,
        target_2nd,
        actual_tmp_p,
        actual_tmp_c,
        actual_size = 0,
        _size_comply = 0,
        _size_all = 0,
        _whs_red_comply = 0,
        _whs_red_all = 0,
        _whs_blue_comply = 0,
        _whs_blue_all = 0,
        _retail_red_comply = 0,
        _retail_red_all = 0,
        _retail_blue_comply = 0,
        _retail_blue_all = 0,
        _kraft_comply = 0,
        _kraft_all = 0,
        _frame_comply = 0,
        _frame_all = 0,
        _2nd_comply = 0,
        _2nd_all = 0,
        __actual = 0;

      result.forEach((val) => {
        __actual = 0;
        actual_tmp_p = JSON.parse(val["display_persen"]);
        actual_tmp_c = JSON.parse(val["display_count"]);
        actual_size = val["display_size"];
        actual_kraft = val["posm_kraft"];
        actual_frame = val["posm_frame"];
        actual_2nd = val["secondary_display"];

        KPI.forEach((kpi) => {
          target_tmp = JSON.parse(kpi["display_ideal"]);
          target_kraft = kpi["posm_kraft"];
          target_frame = kpi["posm_frame"];
          target_2nd = kpi["secondary_display"];

          // chesse store
          if (kpi.focus_id == val.focus_id && kpi.program_id == val.program_id && kpi.re_id == val.re_id) {
            // kraft
            if ("krm" in target_tmp) {
              __actual = typeof actual_kraft == "number" && typeof actual_kraft != "null" ? actual_kraft : 0;
              if (__actual >= target_kraft) {
                _kraft_comply++;
              }
              _kraft_all++;
            }

            // frame
            if ("frm" in target_tmp) {
              __actual = typeof actual_frame == "number" && typeof actual_frame != "null" ? actual_frame : 0;
              if (__actual >= target_kraft) {
                _frame_comply++;
              }
              _frame_all++;
            }

            // 2nd
            if ("sdm" in target_tmp) {
              __actual = typeof actual_2nd == "number" && typeof actual_2nd != "null" ? actual_2nd : 0;
              if (__actual >= target_2nd) {
                _2nd_comply++;
              }
              _2nd_all++;
            }
          }

          // whs
          if (val.flag_whs_retail == 1) {
            if (kpi.focus_id == val.focus_id && kpi.program_id == val.program_id && kpi.re_id == val.re_id) {
              // // ukuran
              if ("uk" in target_tmp) {
                __actual = typeof actual_size == "number" && typeof actual_size != "null" ? actual_size : 0;
                if (__actual >= target_tmp["uk"] * 0.9) {
                  _size_comply++;
                }
                _size_all++;
              }

              // red persen
              if ("rdp" in target_tmp) {
                if (actual_tmp_p == null) {
                  __actual = 0;
                } else {
                  __actual = "red" in actual_tmp_p ? actual_tmp_p.red : 0;
                }
                if (__actual >= target_tmp["rdp"] * 0.9) {
                  _whs_red_comply++;
                }
                _whs_red_all++;
              }

              // // red minimal
              if ("rdm" in target_tmp) {
                if (actual_tmp_c == null) {
                  __actual = 0;
                } else {
                  __actual = "red" in actual_tmp_c ? actual_tmp_c.red : 0;
                }

                if (__actual >= target_tmp["rdm"]) {
                  _whs_red_comply++;
                }
                _whs_red_all++;
              }

              // blue persen/
              if ("bdp" in target_tmp) {
                if (actual_tmp_p == null) {
                  __actual = 0;
                } else {
                  __actual = "blue" in actual_tmp_p ? actual_tmp_p.blue : 0;
                }

                if (__actual >= target_tmp["bdp"] * 0.9) {
                  _whs_blue_comply++;
                }
                _whs_blue_all++;
              }

              // blue minimal
              if ("bdm" in target_tmp) {
                if (actual_tmp_c == null) {
                  __actual = 0;
                } else {
                  __actual = "blue" in actual_tmp_c ? actual_tmp_c.blue : 0;
                }

                if (__actual >= target_tmp["bdm"]) {
                  _whs_blue_comply++;
                }
                _whs_blue_all++;
              }
            }
          }

          // retail
          if (val.flag_whs_retail == 2) {
            if (kpi.focus_id == val.focus_id && kpi.program_id == val.program_id && kpi.re_id == val.re_id) {
              // // ukuran
              if ("uk" in target_tmp) {
                __actual = typeof actual_size == "number" && typeof actual_size != "null" ? actual_size : 0;
                if (__actual >= target_tmp["uk"] * 0.9) {
                  _size_comply++;
                }
                _size_all++;
              }

              // red persen
              if ("rdp" in target_tmp) {
                if (actual_tmp_p == null) {
                  __actual = 0;
                } else {
                  __actual = "red" in actual_tmp_p ? actual_tmp_p.red : 0;
                }
                if (__actual >= target_tmp["rdp"] * 0.9) {
                  _retail_red_comply++;
                }
                _retail_red_all++;
              }

              // // red minimal
              if ("rdm" in target_tmp) {
                if (actual_tmp_c == null) {
                  __actual = 0;
                } else {
                  __actual = "red" in actual_tmp_c ? actual_tmp_c.red : 0;
                }

                if (__actual >= target_tmp["rdm"]) {
                  _retail_red_comply++;
                }
                _retail_red_all++;
              }

              // blue persen/
              if ("bdp" in target_tmp) {
                if (actual_tmp_p == null) {
                  __actual = 0;
                } else {
                  __actual = "blue" in actual_tmp_p ? actual_tmp_p.blue : 0;
                }

                if (__actual >= target_tmp["bdp"] * 0.9) {
                  _retail_blue_comply++;
                }
                _retail_blue_all++;
              }

              // blue minimal
              if ("bdm" in target_tmp) {
                if (actual_tmp_c == null) {
                  __actual = 0;
                } else {
                  __actual = "blue" in actual_tmp_c ? actual_tmp_c.blue : 0;
                }

                if (__actual >= target_tmp["bdm"]) {
                  _retail_blue_comply++;
                }
                _retail_blue_all++;
              }
            }
          }
        });
      });

      // display size
      let display_size = Math.round((_size_comply / _size_all) * 100).toFixed(2);
      let whs_red = Math.round((_whs_red_comply / _whs_red_all) * 100).toFixed(2);
      let whs_blue = Math.round((_whs_blue_comply / _whs_blue_all) * 100).toFixed(2);
      let retail_red = Math.round((_retail_red_comply / _retail_red_all) * 100).toFixed(2);
      let retail_blue = Math.round((_retail_blue_comply / _retail_blue_all) * 100).toFixed(2);
      let kraft__ = Math.round((_kraft_comply / _kraft_all) * 100).toFixed(2);
      let frame__ = Math.round((_frame_comply / _frame_all) * 100).toFixed(2);
      let _2nd__ = Math.round((_2nd_comply / _2nd_all) * 100).toFixed(2);

      display_size = parseFloat(display_size);
      whs_red = parseFloat(whs_red);
      whs_blue = parseFloat(whs_blue);
      retail_red = parseFloat(retail_red);
      retail_blue = parseFloat(retail_blue);
      kraft__ = parseFloat(kraft__);
      frame__ = parseFloat(frame__);
      _2nd__ = parseFloat(_2nd__);

      const category = ["Blue Display", "Red Display", "Size", "Kraft Display", "Kraft 2nd Display", "Kraft Frame"];

      dataExp = {
        category: category,
        nilai: [
          { name: "Retail", data: [retail_blue, retail_red, null] },
          { name: "Whole Saler", data: [whs_blue, whs_red, display_size] },
          { name: "Chesse Store", data: [null, null, null, kraft__, _2nd__, frame__] },
        ],
      };
    }

    return dataExp;
  } catch (error) {
    return error;
  }
};

const AvailabilityPOSM = async (where) => {
  const query = `select posm_id,
                posm_name,
                round((whs_comply / total) * 100, 2)    as whs,
                round((retail_comply / total) * 100, 2) as retail
          from (
                  select posm_id, posm_name, whs_comply, retail_comply, total
                  from (
                            select posm.posm_id                                                as posm_id,
                                  any(posm.posm_name)                                         as posm_name,
                                  sum(if(flag_whs_retail = 1 and posm_ideal_score > 0, 1, 0)) as whs_comply,
                                  sum(if(flag_whs_retail = 2 and posm_ideal_score > 0, 1, 0)) as retail_comply
                            from chview_mpv_batch_per_visit_tt_v3 batch
                                    left join chview_mpv_report_ir_posm posm on batch.visit_id = posm.visit_id
                            ${where}
                            group by posm_id) t1
                            cross join
                        (
                            select count(1) as total
                            from chview_mpv_batch_per_visit_tt_v3
                            ${where}

                            ) t2
                  ) x1
          where posm_name is not null
            and posm_id is not null `;

  try {
    // console.log(query);
    const raws = await ch.querying(query);
    const result = raws.data;

    let dataExp = {
      category: ["tidak ada data"],
      nilai: [
        { name: "Whole Saler", data: [0] },
        { name: "Retailer", data: [0] },
      ],
    };

    if (raws.rows > 0) {
      const category = result.map((x) => x.posm_name);
      const _whs = result.map((x) => x.whs);
      const _retail = result.map((x) => x.retail);

      dataExp = {
        category,
        nilai: [
          { name: "Whole Saler", data: _whs },
          { name: "Retailer", data: _retail },
        ],
      };
    }

    return dataExp;
  } catch (error) {}
};

const AvailabilitySKUPOSM = async (where, mode, where_date) => {
  const query = `
        SELECT
            t2.product_id as product_id,
            x2.product_name as product_name,
            round((t2.whs / x1.total_all) * 100, 2)    as whs,
            round((t2.retail / x1.total_all) * 100, 2) as retail
        FROM (
            select
                product_id,
                count(1)                           as total,
                sum(if(flag_whs_retail = 1, 1, 0)) as whs,
                sum(if(flag_whs_retail = 2, 1, 0)) as retail
            from (
                SELECT
                    product_id, flag_whs_retail
                FROM chview_mpv_batch_visit_tt_v3_raw
                ${where}
                AND ${mode} > 0
                AND product_id is not null
                ) t1
                group by product_id
                order by total desc
                limit 10
            ) t2
        CROSS JOIN (
            select
                sum(total) as total_all
            from (
                select
                    count(1) as total
                from (
                    SELECT
                        product_id
                    FROM chview_mpv_batch_visit_tt_v3_raw
                    ${where}
                    AND ${mode} > 0
                    AND product_id is not null
                    ) t1
                    group by product_id
                    order by total desc
                    limit 10
                ) t2
            ) x1
        LEFT JOIN (
            select
                distinct product_id,
                product_name
            from chview_mpv_batch_visit_tt_v3_raw
            ${where_date}
            ) x2 on t2.product_id = x2.product_id`;

  try {
    // console.log(query);
    const raws = await ch.querying(query);
    const result = raws.data;

    let dataExp = {
      category: ["tidak ada data"],
      nilai: [
        { name: "Whole Saler", data: [0] },
        { name: "Retailer", data: [0] },
      ],
    };

    if (raws.rows > 0) {
      const category = result.map((x) => x.product_name);
      const _whs = result.map((x) => x.whs);
      const _retail = result.map((x) => x.retail);

      dataExp = {
        category,
        nilai: [
          { name: "Whole Saler", data: _whs },
          { name: "Retailer", data: _retail },
        ],
      };
    }

    return dataExp;
  } catch (error) {
    return error;
  }
};

const AvailabilitySellOut = async (filter, mode) => {
  //   filter date
  const year = filter.year;
  const month = filter.month;
  const _date = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("YYYY-MM-DD");
  const startOfMonth = moment(_date).startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment(_date).endOf("month").format("YYYY-MM-DD");

  //   filter lainnya
  const region = filter.region;
  const area = filter.area;
  const city = filter.city;
  const surveyor = filter.surveyor;
  const ltt = filter.ltt;
  const distributor = filter.distributor;
  const re = filter.re;
  const account = filter.account;

  //   where
  let extraCondition = `WHERE tanggal_mulai BETWEEN '${startOfMonth}' and '${endOfMonth}'`;

  if (region != -1 && typeof region != "undefined") extraCondition += ` AND region_id = ${region}`;
  if (area != -1 && typeof area != "undefined") extraCondition += ` AND area_id = ${area}`;
  if (city != -1 && typeof city != "undefined") extraCondition += ` AND city_id = ${city}`;
  if (surveyor != -1 && typeof surveyor != "undefined") extraCondition += ` AND surveyor_id = ${surveyor}`;
  if (ltt != -1 && typeof ltt != "undefined") extraCondition += ` AND is_ltt = ${ltt}`;
  if (distributor != -1 && typeof distributor != "undefined") extraCondition += ` AND distributor_id = ${distributor}`;
  if (re != -1 && typeof re != "undefined") extraCondition += ` AND re_id = ${re}`;
  if (account != -1 && typeof account != "undefined") extraCondition += ` AND account_id = ${account}`;

  // query

  const query2 = `select
            t1.*,
            tx2.count_product as total_top_10,
            round((t1.count_product/ tx2.count_product)*100,2) as ach
        from
            (
            SELECT
                  product_id,
                  any(product_name) as product_name,
                  count(product_id) as count_product
                FROM
                  chview_batch_report_selling_out_tt_v2
                ${extraCondition} and role_id != 0
                group by
                  product_id
                order by
                  count_product desc
                limit 10
            ) t1
        cross join
            ( select sum(count_product) as count_product
                from
                    (
                        SELECT
                  product_id,
                  count(product_id) as count_product
                FROM
                  chview_batch_report_selling_out_tt_v2
                ${extraCondition} and role_id != 0
                group by
                  product_id
                order by
                  count_product desc
                limit 10
                    ) tx1
            ) tx2`;

  // console.log(query2);
  const raw = await ch.querying(query2);
  const result = raw.data;
  // console.log(result);

  const category = result.map((val) => val.product_name);
  const nilai_pie = [];
  const nilai = [];

  result.forEach((val) => {
    nilai_pie.push({ name: val["product_name"], y: val["ach"] });
    // nilai.push(parseInt(val.ach.toFixed(0)));
    nilai.push(val.ach);
  });

  const dataExp = {
    category: category,
    nilai: [{ data: nilai }],
    nilai_pie: nilai_pie,
  };
  // console.log(dataExp);
  return dataExp;
};

const PerformanceSKUPOSMDisp = async (where, mode) => {
  const query = `select t3.*
        from (
            select
              t2.distributor_id2 as distributor_id,
              t2.distributor_name2 as distributor_name,
              t2.distributor_active as distributor_active,
              round(
                (t2.distributor_active / j1.total_store) * 100,
                2
              ) as ach
            from
              (
                select
                  count(distinct t1.store_id) as distributor_active,
                  count(t1.distributor_id) as distributor_active_bak,
                  distributor_id as distributor_id2,
                  any(distributor_name) as distributor_name2
                from
                  (
                    SELECT
                      ifnull(distributor_id, 0) as distributor_id,
                      distributor_name, store_id
                    FROM
                      chview_mpv_batch_per_visit_tt_v3
                    ${where} AND ${mode} > 0
                    and distributor_id != 0
                  ) t1
                group by
                  t1.distributor_id
              ) t2
              LEFT JOIN (
                select
                  ifnull(distributor_id, 0) as distributor_id2,
                  sum(total_store) as total_store
                from
                  chview_master_distributor_store_tt
                  where distributor_id != 0
                group by
                  distributor_id
              ) j1 ON j1.distributor_id2 = t2.distributor_id2
            order by
              t2.distributor_active desc
            limit
              10
        ) t3
        order by t3.distributor_active desc, ach desc`;
  try {
    // console.log(query);
    const raws = await ch.querying(`${query}`);
    const result = raws.data;

    if (raws.rows > 0) {
      return result;
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
};

// export module
module.exports = {
  getDataMap,
  getP7Store,
  getStoreList,
  getP7Component,
  getTrendChart,
  getIdealScoreRECategory,
  getScoreAvailability,
  getIdealPerformance,
  getSelloutComponent,
  getSellOutPerformance,
  getSellOutTrendChart,
  getStoreListByVisit,
};
