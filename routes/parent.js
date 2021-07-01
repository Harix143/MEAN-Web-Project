var express = require("express");
var router = express.Router();
const Schedule = require("../models/schedule.model");
const Complaint = require("../models/complaint.model");
const Student = require("../models/student.model");
const Driver = require("../models/driver.model");
const Van = require("../models/van.model");
const Route = require("../models/route.model");
const auth = require("../authentication/parent.authenticate");

/************************************COMPLAINT OPERATIONS******************************** */

//Get filed complaints
router.get("/complaints/:pId", auth.verifyJwtToken, function (req, res, next) {
  Complaint.find({ parentId: req.params.pId })
    .sort("title")
    .exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Unable to find complaints" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "No Complaint Found" });
          return;
        }
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET specific compalint */
router.get(
  "/complaint/:pId/:cid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Complaint.find({ _id: req.params.cid, parentId: req.params.pId })
      .then((complaint) => {
        if (complaint.length == 0) {
          res.status(404).send({ message: "No Complaint Found" });
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(complaint);
      })
      .catch((err) => {
        res.status(500).send("Unable to find the complaint");
      });
  }
);

//FILE new Complaint
router.post(
  "/filecomplaint/:pId",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      var title = req.body.title;
      var description = req.body.description;
      var status = "Pending";
      var Feedback = "None.";
      var _id = req.params.pId;
      const complaint = await new Complaint({
        title,
        description,
        status,
        Feedback,
        parentId: _id,
      });
      complaint
        .save()
        .then((doc) => {
          res
            .status(201)
            .send({ message: "Complaint filed successfully! ", result: doc });
        })
        .catch((err) => {
          next(err);
        });
    } catch (e) {
      res.send(e);
    }
  }
);

//Delete complaint
router.delete(
  "/deletecomplaint/:pId/:cid",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const complaint = await Complaint.find({
        _id: req.params.cid,
        parentId: req.params.pId,
      }).exec(function (error, results) {
        if (error) {
          res
            .status(500)
            .send({ message: "Unable to find complaint to be deleted" });
        } else {
          if (results.length == 0) {
            res
              .status(404)
              .send({ message: "No Complaint Found to be deleted" });
            return;
          }
          Complaint.deleteOne(
            { _id: req.params.cid, parentId: req.params.pId },
            function (error, results) {
              if (error) {
                res.status(500).send("Could not delete Complaint");
              } else
                res.status(200).send({
                  mesasge: "Following complaint has been deleted successfully",
                  result: results,
                });
            }
          );
        }
      });
    } catch (e) {
      res.status(500).send("cound not delete complaint");
    }
  }
);

module.exports = router;
