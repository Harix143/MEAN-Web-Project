var express = require("express");
var router = express.Router();
const Schedule = require("../models/schedule.model");
const Complaint = require("../models/complaint.model");
const Student = require("../models/student.model");
const Driver = require("../models/driver.model");
const Van = require("../models/van.model");
const Route = require("../models/route.model");
const auth = require("../authentication/driver.authenticate");

/**************************************UPDATE Profile *************************************/

/* UPDATE Profile */
router.patch(
  "/updateprofile/:id",
  auth.verifyJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.params.id;
      const student = await Student.findById({ _id });
      if (student.length == 0) {
        res.send("Student does not exists");
      } else {
        const updatedStudent = await Student.findByIdAndUpdate(_id, req.body, {
          new: true,
        });
        res.status(200).send({
          messaage: "Profile has been updated successfully",
          result: updatedStudent,
        });
      }
    } catch (e) {
      next(e);
    }
  }
);

/************************************COMPLAINT OPERATIONS******************************** */

//Get filed complaints
router.get("/complaints/:did", auth.verifyJwtToken, function (req, res, next) {
  Complaint.find({ driverId: req.params.did })
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
  "/complaint/:did/:cid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Complaint.find({ _id: req.params.cid, driverId: req.params.did })
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
  "/filecomplaint/:dId",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      var title = req.body.title;
      var description = req.body.description;
      var status = "Pending";
      var Feedback = "None.";
      var _id = req.params.dId;
      const complaint = await new Complaint({
        title,
        description,
        status,
        Feedback,
        driverId: _id,
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
  "/deletecomplaint/:did/:cid",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const complaint = await Complaint.find({
        _id: req.params.cid,
        driverId: req.params.did,
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
            { _id: req.params.cid, driverId: req.params.did },
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

/************************************SCHEDULE OPERATIONS******************************** */

//Get created schedules
router.get("/schedules/:sid", auth.verifyJwtToken, function (req, res, next) {
  Schedule.find({ studentId: req.params.sid })
    .sort("schoolStartingTime")
    .exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Unable to find schedules" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "No Schedule Found" });
          return;
        }
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/***********ASSIGNED STUDENTS********** */

//VIEW Assigned students to a driver
router.get(
  "/assignedstudents/:did",
  auth.verifyJwtToken,
  function (req, res, next) {
    Driver.findOne({ _id: req.params.did }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Driver does not exist" });
          return;
        } else {
          Student.find({ assignedDriver: req.params.did })
            .then((students) => {
              if (students.length > 0)
                res
                  .status(200)
                  .send({ message: "The assigned students are ", students });
              else
                res.status(404).send({
                  message:
                    "You are not assigned any Student Yet! Please Contact Admin ",
                  students,
                });
            })
            .catch((err) => {
              next(err);
            });
        }
      }
    });
  }
);

/**************ASSIGNED VAN************* */
//View Assigned Van to Driver
router.get("/assignedvan/:did", auth.verifyJwtToken, function (req, res, next) {
  Driver.findOne({ _id: req.params.did }).exec(function (error, results) {
    if (error) {
      res.status(500).send({ message: "Something went wrong" });
    } else {
      if (results.length == 0) {
        res.status(404).send({ message: "Driver does not exist" });
        return;
      } else {
        Van.findOne({ _id: results.assignedVan })
          .then((van) => {
            if (van)
              res.status(200).send({ message: "The assigned van is ", van });
            else
              res.status(404).send({
                message:
                  "You are not assigned any van yet! Please contact Admin",
                van,
              });
          })
          .catch((err) => {
            next(err);
          });
      }
    }
  });
});

/**************ASSIGNED ROUTE************** */
//View Assigned route to Driver
router.get(
  "/assignedroutetodriver/:did",
  auth.verifyJwtToken,
  function (req, res, next) {
    Driver.findOne({ _id: req.params.did }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Driver does not exist" });
          return;
        } else {
          Route.findOne({ _id: results.assignedRoute })
            .then((route) => {
              if (route)
                res
                  .status(200)
                  .send({ message: "The assigned route is ", route });
              else
                res.status(404).send({
                  message:
                    "You are not assigned any Route yet! Please contact Admin",
                  route,
                });
            })
            .catch((err) => {
              next(err);
            });
        }
      }
    });
  }
);

module.exports = router;
