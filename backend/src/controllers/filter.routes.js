const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filter.controller");

// Cấu hình các endpoint
router.get("/", filterController.getFilters);
router.post("/", filterController.createFilter);
router.delete("/:id", filterController.deleteFilter);

module.exports = router;