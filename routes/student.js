var express = require("express");
var router = express.Router();
const Schedule = require("../models/schedule.model");
const Complaint = require("../models/complaint.model");
const Student = require("../models/student.model");
const Driver = require("../models/driver.model");
const Van = require("../models/van.model");
const Route = require("../models/route.model");
const auth = require("../authentication/student.authenticate");

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
router.get("/complaints/:sid", auth.verifyJwtToken, function (req, res, next) {
  Complaint.find({ studentId: req.params.sid })
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
  "/complaint/:sid/:cid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Complaint.find({ _id: req.params.cid, studentId: req.params.sid })
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
  "/filecomplaint/:sId",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      var title = req.body.title;
      var description = req.body.description;
      var status = "Pending";
      var Feedback = "None.";
      var _id = req.params.sId;
      const complaint = await new Complaint({
        title,
        description,
        status,
        Feedback,
        studentId: _id,
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
  "/deletecomplaint/:sid/:cid",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const complaint = await Complaint.find({
        _id: req.params.cid,
        studentId: req.params.sid,
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
            { _id: req.params.cid, studentId: req.params.sid },
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

/* GET specific compalint */
router.get(
  "/schedule/:stdid/:schid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Schedule.find({ _id: req.params.schid, studentId: req.params.stdid })
      .then((schedule) => {
        if (schedule.length == 0) {
          res.status(404).send({ message: "Schedule not Found" });
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(schedule);
      })
      .catch((err) => {
        res.status(500).send("Unable to find the schedule");
      });
  }
);

//CREATE new Schedule
router.post(
  "/createschedule/:sId",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      Student.find({ _id: req.params.sId }).exec(async function (
        error,
        results
      ) {
        if (error) {
          res.status(500).send({ message: "Invalid student ID" });
        } else if (results.length == 0) {
          res
            .status(404)
            .send({ message: "Inavalid Student ID! Student Not found " });
        } else {
          var schoolStartingTime = req.body.schoolStartingTime;
          var schoolClosingTime = req.body.schoolClosingTime;
          var studentId = req.params.sId;
          const schedule = await new Schedule({
            schoolStartingTime,
            schoolClosingTime,
            studentId,
          });
          schedule
            .save()
            .then((doc) => {
              res.status(201).send({
                message: "Schedule created successfully! ",
                result: doc,
              });
            })
            .catch((err) => {
              next(err);
            });
        }
      });
    } catch (e) {
      res.send(e);
    }
  }
);

//Delete Schedule
router.delete(
  "/deleteschedule/:stdid/:schid",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      Student.find({ _id: req.params.stdid }).exec(function (error, results) {
        if (error) {
          res.status(500).send({ message: "Invalid student ID" });
        } else {
          if (results.length == 0) {
            res
              .status(404)
              .send({ message: "Inavalid Student ID! Student Not found " });
            return;
          }
        }
      });

      const schedule = await Schedule.find({
        _id: req.params.schid,
        studentId: req.params.stdid,
      }).exec(function (error, results) {
        if (error) {
          res
            .status(500)
            .send({ message: "Unable to find schedule to be deleted" });
        } else {
          if (results.length == 0) {
            res
              .status(404)
              .send({ message: "Schedule not Found to be deleted" });
            return;
          }
          Schedule.deleteOne(
            { _id: req.params.schid, studentId: req.params.stdid },
            function (error, results) {
              if (error) {
                res.status(500).send("Could not delete schedule");
              } else
                res.status(200).send({
                  mesasge: "Following schedule has been deleted successfully",
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

/*************ASSIGNED VAN*********** */

router.get("/assignedvan/:sid", auth.verifyJwtToken, function (req, res, next) {
  Student.findOne({ _id: req.params.sid }).exec(function (error, results) {
    if (error) {
      res.status(500).send({ message: "Something went wrong" });
    } else {
      if (results.length == 0) {
        res.status(404).send({ message: "Student does not exist" });
        return;
      } else {
        if (results.assignedDriver) {
          Driver.findById({ _id: results.assignedDriver })
            .then((driver) => {
              if (driver.assignedVan) {
                Van.findById({ _id: driver.assignedVan })
                  .then((van) => {
                    res
                      .status(200)
                      .send({ message: "The assigned Van is ", van });
                  })
                  .catch((err) => {
                    next(err);
                  });
              } else {
                res.send
                  .status(404)
                  .send("The assigned Driver is not assigned to any van yet!");
              }
            })
            .catch((err) => {
              next(err);
            });
        } else {
          res.status(404).send({ message: "No Driver Assigned!" });
          return;
        }
      }
    }
  });
});

/*************ASSIGNED DRIVER*********** */

router.get(
  "/assigneddriver/:sid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Student.findOne({ _id: req.params.sid }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Student does not exist" });
          return;
        } else {
          if (results.assignedDriver) {
            Driver.findById({ _id: results.assignedDriver })
              .then((driver) => {
                res
                  .status(200)
                  .send({ message: "Assigned Driver Found!", driver });
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.status(404).send({
              message:
                "No Driver Assigned Yet. Please Request Admin to Assign Van.",
            });
            return;
          }
        }
      }
    });
  }
);

/************************************ASSIGNED ROUTE******************************** */

router.get(
  "/assignedroute/:sid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Student.findOne({ _id: req.params.sid }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Student does not exist" });
          return;
        } else {
          if (results.assignedDriver) {
            Driver.findById({ _id: results.assignedDriver })
              .then((driver) => {
                if (driver.assignedRoute) {
                  Route.findById({ _id: driver.assignedRoute })
                    .then((route) => {
                      res
                        .status(200)
                        .send({ message: "The assigned Route is ", route });
                    })
                    .catch((err) => {
                      next(err);
                    });
                } else {
                  res.send
                    .status(404)
                    .send(
                      "The assigned Driver is not assigned to any route yet!"
                    );
                }
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.status(404).send({ message: "No Driver Assigned!" });
            return;
          }
        }
      }
    });
  }
);

module.exports = router;
